import { Router } from 'express';
import { createPoll, getPollById, submitVote } from '../controllers/poll.controller.js';

const router = Router();

router.post('/', createPoll);
router.get('/:id', getPollById);
router.post('/:id/vote', submitVote);

export default router;