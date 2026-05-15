import express from 'express';
import connectDB from './src/database/connection.js';
import app from './src/app.js';

const PORT = 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});