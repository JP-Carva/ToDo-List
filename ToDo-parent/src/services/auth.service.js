import bcrypt from 'bcrypt';
import { findByEmail, create, deleteById } from '../repositories/user.repository.js';
import { generateToken, verifyToken } from './jwt.service.js';
import User from '../models/User.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(username, email, password) {
    validateRegisterInput(username, email, password);
    
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
    validateLoginInput(email, password);

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

function validateRegisterInput(username, email, password) {
    validateUsername(username);
    validateEmail(email);
    validatePassword(password);

    function validateUsername(user) {
        if (!user || typeof user !== 'string' || user.trim().length === 0) {
            throw { status: 400, message: 'Nome de usuário é obrigatório.' };
        }
    }

    function validateEmail(userEmail) {
        if (!userEmail || typeof userEmail !== 'string' || !EMAIL_REGEX.test(userEmail)) {
            throw { status: 400, message: 'Email inválido.' };
        }
    }

    function validatePassword(pass) {
        if (!pass || typeof pass !== 'string' || pass.length < 6) {
            throw { status: 400, message: 'Senha deve ter no mínimo 6 caracteres.' };
        }
    }
}

function validateLoginInput(email, password) {
    if (!email || !password) {
        throw { status: 400, message: 'Email e senha são obrigatórios.' };
    }
}

async function deleteUserAccount(userId) {
    if (!userId) {
        throw new Error('ID do usuário é obrigatório');
    }
    return await deleteById(userId);
}

export { register, login, deleteUserAccount };
