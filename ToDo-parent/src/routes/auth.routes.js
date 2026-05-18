import express from 'express';
import { register, login, deleteUser } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.delete('/profile', authMiddleware, deleteUser);

export default router;
