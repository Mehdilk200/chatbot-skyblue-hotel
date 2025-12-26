import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'stayava.db');

class Database {
    constructor() {
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('❌ Database connection error:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database');
                    resolve();
                }
            });
        });
    }

    async initialize() {
        if (!this.db) {
            await this.connect();
        }

        // Enable foreign keys
        await this.run('PRAGMA foreign_keys = ON');

        // Create tables
        await this.createUsersTable();
        await this.createConversationsTable();
        await this.createBookingsTable();
    }

    async createUsersTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone TEXT,
                is_verified BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await this.run(sql);
        console.log('✅ Users table created/verified');
    }

    async createConversationsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                session_id TEXT NOT NULL,
                messages TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await this.run(sql);
        console.log('✅ Conversations table created/verified');
    }

    async createBookingsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                hotel_id INTEGER NOT NULL,
                hotel_name TEXT NOT NULL,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                guests INTEGER NOT NULL,
                total_price DECIMAL(10,2),
                booking_status TEXT DEFAULT 'confirmed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await this.run(sql);
        console.log('✅ Bookings table created/verified');
    }

    // Generic database operations
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // User operations
    async createUser(userData) {
        const { email, passwordHash, firstName, lastName, phone } = userData;
        const sql = `
            INSERT INTO users (email, password_hash, first_name, last_name, phone)
            VALUES (?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [email, passwordHash, firstName, lastName, phone]);
    }

    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        return await this.get(sql, [email]);
    }

    async getUserById(id) {
        const sql = 'SELECT id, email, first_name, last_name, phone, is_verified, created_at FROM users WHERE id = ?';
        return await this.get(sql, [id]);
    }

    // Conversation operations
    async saveConversation(conversationData) {
        const { userId, sessionId, messages } = conversationData;
        const sql = `
            INSERT INTO conversations (user_id, session_id, messages)
            VALUES (?, ?, ?)
        `;
        return await this.run(sql, [userId, sessionId, JSON.stringify(messages)]);
    }

    async getConversation(sessionId) {
        const sql = 'SELECT * FROM conversations WHERE session_id = ? ORDER BY created_at DESC LIMIT 1';
        return await this.get(sql, [sessionId]);
    }

    async getUserConversations(userId) {
        const sql = 'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20';
        return await this.all(sql, [userId]);
    }

    async updateConversation(id, messages) {
        const sql = `
            UPDATE conversations 
            SET messages = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        return await this.run(sql, [JSON.stringify(messages), id]);
    }

    // Booking operations
    async createBooking(bookingData) {
        const { userId, hotelId, hotelName, checkIn, checkOut, guests, totalPrice } = bookingData;
        const sql = `
            INSERT INTO bookings (user_id, hotel_id, hotel_name, check_in, check_out, guests, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [userId, hotelId, hotelName, checkIn, checkOut, guests, totalPrice]);
    }

    async getUserBookings(userId) {
        const sql = 'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC';
        return await this.all(sql, [userId]);
    }

    // Close database connection
    close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('❌ Error closing database:', err.message);
                    } else {
                        console.log('✅ Database connection closed');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Export singleton instance
export const db = new Database();
export default db;
