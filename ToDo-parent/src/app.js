import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import { connectDB, sql } from './database/connection.js';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API funcionando!');
});

app.use('/api/auth', authRoutes);
app.use('/api/task', taskRoutes);

export default app;