import * as authService from '../services/auth.service.js';
import authMiddleware from '../middleware/auth.js';

async function register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const result = await authService.register(username, email, password);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Erro ao registrar usuário:', error && error.stack ? error.stack : error);
        
        if (error.message === 'Email já registrado') {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        const result = await authService.login(email, password);
        return res.json(result);
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        
        if (error.message === 'Credenciais inválidas') {
            return res.status(401).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

async function deleteUser(req, res) {
    const userId = req.user.id;
    try {
        await authService.deleteUserAccount(userId);
        return res.json({ message: 'Conta deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error.message);
        if (error.message === 'Usuário não encontrado') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export { register, login, deleteUser };