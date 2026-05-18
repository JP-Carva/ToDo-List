import express from 'express';
import { create, list, remove, update } from '../controllers/task.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/create', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;