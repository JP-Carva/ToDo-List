import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import { connectDB, sql } from './database/connection.js';
import { setupSwagger } from './docs/swagger.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));

app.use(express.json());

setupSwagger(app);

app.get('/', (req, res) => {
    res.send('Bem-vindo à API ToDo!');
});

app.use('/api/auth', authRoutes);
app.use('/api/task', taskRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(err && err.status ? err.status : 500).json({ error: 'Erro interno do servidor' });
});

export default app;