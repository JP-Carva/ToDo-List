import bcrypt from 'bcrypt';
import { findByEmail, create } from '../repositories/user.repository.js';
import { generateToken, verifyToken } from './jwt.service.js';

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function register(username, email, password) {
    // Validações de entrada
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        throw new Error('Nome de usuário é obrigatório');
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
        throw new Error('Email inválido');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const existingUser = await findByEmail(email);
    
    if (existingUser) {
        throw new Error('Email já registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await create(username, email, hashedPassword);

    const token = generateToken(user);

    return { token };
}

async function login(email, password) {
    if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
    }

    const user = await findByEmail(email);

    if (!user || !user.id) {
        throw new Error('Credenciais inválidas');
    }
    
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new Error('Credenciais inválidas');
    }

    const token = generateToken(user);

    return { token };
}

export { register, login };
