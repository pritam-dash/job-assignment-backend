import jwt from 'jsonwebtoken';
const { verify } = jwt;

export function authenticate(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    verify(token.split(' ')[1], process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ error: 'Failed to authenticate' });
        req.companyId = decoded.id;
        next();
    });
}
