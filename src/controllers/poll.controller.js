import { prisma } from '../index.js';

// WebSocket server instance and connection storage
let wssInstance;
const pollSubscriptions = new Map(); // pollId -> Set<WebSocket>

export const registerWSServer = (wss) => {
    wssInstance = wss;
    wssInstance.on('connection', (ws) => {
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'subscribe' && data.pollId) {
                    subscribeClientToPoll(ws, data.pollId);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        });

        ws.on('close', () => {
            // Clean up subscriptions on disconnect
            pollSubscriptions.forEach((clients, pollId) => {
                if (clients.has(ws)) {
                    clients.delete(ws);
                    if (clients.size === 0) {
                        pollSubscriptions.delete(pollId);
                    }
                }
            });
        });
    });
};

const subscribeClientToPoll = (ws, pollId) => {
    if (!pollSubscriptions.has(pollId)) {
        pollSubscriptions.set(pollId, new Set());
    }
    pollSubscriptions.get(pollId).add(ws);
    console.log(`Client subscribed to poll ${pollId}`);
};

const broadcastPollUpdates = async (pollId) => {
    if (pollSubscriptions.has(pollId)) {
        const results = await getPollResults(pollId);
        const message = JSON.stringify({ type: 'update', pollId, results });

        pollSubscriptions.get(pollId).forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(message);
            }
        });
    }
};

// Helper to get poll results with vote counts
const getPollResults = async (pollId) => {
    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            options: {
                include: {
                    _count: {
                        select: { votes: true },
                    },
                },
            },
        },
    });
    return poll;
};


// --- API Controllers ---

export const createPoll = async (req, res) => {
  const { question, options, creatorId } = req.body; // options is an array of strings
  try {
    const newPoll = await prisma.poll.create({
      data: {
        question,
        creatorId,
        options: {
          create: options.map(text => ({ text })),
        },
      },
      include: { options: true },
    });
    res.status(201).json(newPoll);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data or user not found.' });
  }
};

export const getPollById = async (req, res) => {
    const { id } = req.params;
    try {
        const poll = await getPollResults(id);
        if (!poll) return res.status(404).json({ error: 'Poll not found.' });
        res.json(poll);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch poll.' });
    }
};

export const submitVote = async (req, res) => {
    const { id: pollId } = req.params;
    const { userId, pollOptionId } = req.body;

    try {
        // Use a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Check if user has already voted on this poll
            const existingVote = await tx.vote.findFirst({
                where: { userId, pollId },
            });

            if (existingVote) {
                throw new Error('User has already voted on this poll.');
            }

            // 2. Create the new vote
            await tx.vote.create({
                data: { userId, pollOptionId, pollId },
            });
        });

        // After successful vote, broadcast the update
        broadcastPollUpdates(pollId);

        res.status(201).json({ message: 'Vote submitted successfully.' });

    } catch (error) {
        if (error.message.includes('already voted')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(400).json({ error: 'Invalid vote or user/option not found.' });
    }
};