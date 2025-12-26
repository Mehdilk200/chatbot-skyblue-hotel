import cors from "cors";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { db } from "./database.js";
import { authenticateToken, optionalAuth, authService } from "./auth.js";

dotenv.config();

const app = express();
const PORT = 3090;

// Database initialization
async function initializeDatabase() {
    try {
        await db.connect();
        await db.initialize();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5500', 'file://'],
    credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 chat requests per minute
    message: {
        error: 'Trop de demandes de chat. Réessayez dans une minute.',
        code: 'CHAT_RATE_LIMIT_EXCEEDED'
    }
});

// Initialize database when server starts
initializeDatabase();

// ==================== AUTHENTICATION ENDPOINTS ====================

// User registration
app.post("/api/auth/signup", authLimiter, async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Input validation
        if (!email || !password || !firstName || !lastName || !phone) {
            return res.status(400).json({
                error: 'Tous les champs sont requis',
                code: 'MISSING_FIELDS'
            });
        }

        const result = await authService.register({
            email,
            password,
            firstName,
            lastName,
            phone
        });

        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès',
            user: result.user,
            token: result.token
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({
            error: error.message,
            code: 'SIGNUP_FAILED'
        });
    }
});

// User login
app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email et mot de passe requis',
                code: 'MISSING_CREDENTIALS'
            });
        }

        const result = await authService.login(email, password);

        res.json({
            success: true,
            message: 'Connexion réussie',
            user: result.user,
            token: result.token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            error: error.message,
            code: 'LOGIN_FAILED'
        });
    }
});

// User logout
app.post("/api/auth/logout", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Déconnexion réussie'
    });
});

// Get user profile
app.get("/api/user/profile", authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                isVerified: user.is_verified,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération du profil',
            code: 'PROFILE_ERROR'
        });
    }
});

// ==================== CONVERSATION ENDPOINTS ====================

// Save conversation
app.post("/api/conversations", optionalAuth, async (req, res) => {
    try {
        const { sessionId, messages } = req.body;

        if (!sessionId || !messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Session ID et messages requis',
                code: 'INVALID_CONVERSATION_DATA'
            });
        }

        const conversationData = {
            userId: req.user ? req.user.id : null,
            sessionId,
            messages
        };

        const result = await db.saveConversation(conversationData);

        res.status(201).json({
            success: true,
            message: 'Conversation sauvegardée',
            conversationId: result.id
        });

    } catch (error) {
        console.error('Save conversation error:', error);
        res.status(500).json({
            error: 'Erreur lors de la sauvegarde',
            code: 'SAVE_CONVERSATION_ERROR'
        });
    }
});

// Get conversation by session
app.get("/api/conversations/:sessionId", optionalAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const conversation = await db.getConversation(sessionId);
        if (!conversation) {
            return res.status(404).json({
                error: 'Conversation non trouvée',
                code: 'CONVERSATION_NOT_FOUND'
            });
        }

        // Check if user owns this conversation
        if (conversation.user_id && req.user && conversation.user_id !== req.user.id) {
            return res.status(403).json({
                error: 'Accès non autorisé à cette conversation',
                code: 'UNAUTHORIZED_ACCESS'
            });
        }

        res.json({
            success: true,
            conversation: {
                ...conversation,
                messages: JSON.parse(conversation.messages)
            }
        });

    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération',
            code: 'GET_CONVERSATION_ERROR'
        });
    }
});

// Get user's conversation history
app.get("/api/conversations", authenticateToken, async (req, res) => {
    try {
        const conversations = await db.getUserConversations(req.user.id);

        const formattedConversations = conversations.map(conv => ({
            ...conv,
            messages: JSON.parse(conv.messages)
        }));

        res.json({
            success: true,
            conversations: formattedConversations
        });

    } catch (error) {
        console.error('Get user conversations error:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération de l\'historique',
            code: 'GET_HISTORY_ERROR'
        });
    }
});

// ==================== BOOKING ENDPOINTS ====================

// Create booking
app.post("/api/bookings", authenticateToken, async (req, res) => {
    try {
        const { hotelId, hotelName, checkIn, checkOut, guests, totalPrice } = req.body;

        if (!hotelId || !hotelName || !checkIn || !checkOut || !guests) {
            return res.status(400).json({
                error: 'Données de réservation incomplètes',
                code: 'INCOMPLETE_BOOKING_DATA'
            });
        }

        const bookingData = {
            userId: req.user.id,
            hotelId,
            hotelName,
            checkIn,
            checkOut,
            guests,
            totalPrice
        };

        const result = await db.createBooking(bookingData);

        res.status(201).json({
            success: true,
            message: 'Réservation créée avec succès',
            bookingId: result.id
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            error: 'Erreur lors de la création de la réservation',
            code: 'CREATE_BOOKING_ERROR'
        });
    }
});

// Get user bookings
app.get("/api/bookings", authenticateToken, async (req, res) => {
    try {
        const bookings = await db.getUserBookings(req.user.id);

        res.json({
            success: true,
            bookings
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des réservations',
            code: 'GET_BOOKINGS_ERROR'
        });
    }
});

// ==================== CHAT ENDPOINT ====================

app.post("/api/chat", chatLimiter, async (req, res) => {
    try {
        const GEMINI_KEY = process.env.GEMINI_KEY;
        const { prompt, sessionId } = req.body;

        // Input validation
        const sanitizedPrompt = req.body.prompt?.trim();
        if (!sanitizedPrompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        if (!sessionId) {
            return res.status(400).json({ 
                error: "Session ID required for conversation tracking",
                code: "NO_SESSION_ID"
            });
        }

        if (!GEMINI_KEY) {
            console.warn('⚠️ Gemini API key not configured');
            // Save anonymous conversation
            await db.saveConversation({
                userId: null,
                sessionId,
                messages: [
                    { role: 'user', content: sanitizedPrompt, timestamp: new Date().toISOString() },
                    { role: 'assistant', content: 'Désolé, le service IA n\'est pas disponible actuellement.', timestamp: new Date().toISOString() }
                ]
            });
            return res.json({ text: "Désolé, le service IA n'est pas disponible actuellement. Veuillez réessayer plus tard." });
        }

        // Sanitize input
        const limitedPrompt = sanitizedPrompt.substring(0, 2000);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: limitedPrompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 512
                    }
                })
            }
        );

        if (!response.ok) {
            console.error(`Gemini API Error: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ error: "Gemini API error" });
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer une réponse.";

        // Save conversation to database
        try {
            await db.saveConversation({
                userId: req.user ? req.user.id : null,
                sessionId,
                messages: [
                    { role: 'user', content: sanitizedPrompt, timestamp: new Date().toISOString() },
                    { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
                ]
            });
        } catch (saveError) {
            console.error('Failed to save conversation:', saveError);
            // Continue response even if saving fails
        }

        res.json({ text: aiResponse });

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: "Erreur du serveur" });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Stayava API is running",
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down server...');
    await db.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Shutting down server...');
    await db.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   POST /api/auth/signup - User registration`);
    console.log(`   POST /api/auth/login - User login`);
    console.log(`   POST /api/auth/logout - User logout`);
    console.log(`   GET /api/user/profile - Get user profile`);
    console.log(`   POST /api/conversations - Save conversation`);
    console.log(`   GET /api/conversations/:sessionId - Get conversation`);
    console.log(`   GET /api/conversations - Get user history`);
    console.log(`   POST /api/bookings - Create booking`);
    console.log(`   GET /api/bookings - Get user bookings`);
    console.log(`   POST /api/chat - AI chat with Gemini`);
    console.log(`   GET /api/health - Health check`);
});
