import { prisma } from '../index.js';


export const createUser = async (req, res) => {
  const { name, email, passwordHash } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Email already exists or invalid data.' });
  }
};

export const getUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};