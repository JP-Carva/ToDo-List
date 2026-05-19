import { connectDB, sql } from '../database/connection.js';

async function findByEmail(email) {
    try {
        const db = await connectDB();
        const result = await db.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
        console.error('Erro ao buscar usuário por email:', error);
        throw error;
    }
}

async function create(username, email, hashedPassword) {
    try {
        const db = await connectDB();
        const result = await db.request()
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.VarChar, hashedPassword)
            .query('INSERT INTO Users (username, email, password_hash) VALUES (@username, @email, @password_hash); SELECT * FROM Users WHERE email = @email');
        
        return result.recordset[0];
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
    }
}

async function deleteById(id) {
    try {
        const db = await connectDB();
        const result = await db.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Users WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            throw new Error('Usuário não encontrado');
        }
    } catch (error) {
        console.error('Erro ao deletar usuário por ID:', error);
        throw error;
    }
}

export { findByEmail, create, deleteById };
