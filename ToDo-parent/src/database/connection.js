import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const rawServer = process.env.DB_SERVER || '';
let server = rawServer;
const options = {
    trustServerCertificate: true,
    encrypt: false
};

// Support named instance format: SERVER\INSTANCE
if (rawServer.includes('\\')) {
    const parts = rawServer.split('\\');
    server = parts[0];
    const instanceName = parts.slice(1).join('\\');
    if (instanceName) options.instanceName = instanceName;
}

const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server,
    database: process.env.DB_DATABASE,
    ...(port ? { port } : {}),
    options,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

const connectDB = async () => {
    if (!pool) {
        try {
            pool = await sql.connect(config);
            console.log('Banco conectado com sucesso!');
        } catch (error) {
            console.error('Erro ao conectar no banco:', error);
        }
    }
    return pool;
};

export { connectDB, sql };
export default connectDB;