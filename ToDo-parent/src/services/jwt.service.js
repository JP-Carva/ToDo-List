import jwt from 'jsonwebtoken';

function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return token;
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        throw error;
    }
}

export { generateToken, verifyToken };
