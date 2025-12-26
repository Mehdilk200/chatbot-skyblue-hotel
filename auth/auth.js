import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './database.js';

class AuthService {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'stayava-secret-key-2025';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
        this.BCRYPT_ROUNDS = 12;
    }

    // Hash password
    async hashPassword(password) {
        return await bcrypt.hash(password, this.BCRYPT_ROUNDS);
    }

    // Verify password
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    // Generate JWT token
    generateToken(userId) {
        return jwt.sign(
            { userId },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Validate phone number (Morocco format)
    validatePhone(phone) {
        const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Sanitize input
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, '');
    }

    // Rate limiting key generator
    getRateLimitKey(req) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        return `rate_limit_${ip}`;
    }

    // User registration
    async register(userData) {
        const { email, password, firstName, lastName, phone } = userData;

        // Validate inputs
        if (!this.validateEmail(email)) {
            throw new Error('Format d\'email invalide');
        }

        if (!this.validatePassword(password)) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
        }

        if (!this.validatePhone(phone)) {
            throw new Error('Format de téléphone marocain invalide');
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            throw new Error('Un compte avec cet email existe déjà');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create user
        const result = await db.createUser({
            email: email.toLowerCase(),
            passwordHash,
            firstName: this.sanitizeInput(firstName),
            lastName: this.sanitizeInput(lastName),
            phone: phone.replace(/\s/g, '')
        });

        const userId = result.id;
        const token = this.generateToken(userId);

        return {
            success: true,
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                phone
            },
            token
        };
    }

    // User login
    async login(email, password) {
        // Validate inputs
        if (!email || !password) {
            throw new Error('Email et mot de passe requis');
        }

        // Get user by email
        const user = await db.getUserByEmail(email.toLowerCase());
        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Verify password
        const isValidPassword = await this.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Generate token
        const token = this.generateToken(user.id);

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                isVerified: user.is_verified
            },
            token
        };
    }

    // Get user from token
    async getUserFromToken(token) {
        if (!token) {
            throw new Error('Token requis');
        }

        const decoded = this.verifyToken(token);
        if (!decoded) {
            throw new Error('Token invalide ou expiré');
        }

        const user = await db.getUserById(decoded.userId);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        return user;
    }
}

// Auth middleware
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            error: 'Token d\'accès requis',
            code: 'NO_TOKEN'
        });
    }

    try {
        const authService = new AuthService();
        const user = await authService.getUserFromToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ 
            error: error.message,
            code: 'INVALID_TOKEN'
        });
    }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const authService = new AuthService();
            const user = await authService.getUserFromToken(token);
            req.user = user;
        } catch (error) {
            // Ignore auth errors for optional auth
            console.log('Optional auth failed:', error.message);
        }
    }
    next();
};

export const authService = new AuthService();
export default AuthService;
