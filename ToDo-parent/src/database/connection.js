import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),

    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('Banco conectado com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar no banco:', error);
    }
};

export { sql, connectDB };
export default connectDB;