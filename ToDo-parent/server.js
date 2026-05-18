import express from 'express';
import connectDB from './src/database/connection.js';
import app from './src/app.js';

const PORT = 3000;

connectDB();

app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});