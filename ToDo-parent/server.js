import connectDB from './src/database/connection.js';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

async function start() {
    process.once('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.once('uncaughtException', (err) => {
        console.error('Uncaught Exception thrown:', err && err.stack ? err.stack : err);
    });

    try {
        await connectDB();

        app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));

        const server = app.listen(PORT, () => {
            console.log(`API rodando em http://localhost:${PORT}`);
        });


        return server;
    } catch (err) {
        console.error('Erro ao iniciar servidor:', err && err.stack ? err.stack : err);
        process.exit(1);
    }
}

start();