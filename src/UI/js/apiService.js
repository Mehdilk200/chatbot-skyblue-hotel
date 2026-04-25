/**
 * ApiService - Centralized service for backend communication
 */
class ApiService {
    constructor(baseUrl = 'http://localhost:2323') {
        this.baseUrl = baseUrl;
    }

    /**
     * Helper to handle fetch requests
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Add auth header if token exists
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.message || `API Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`Request to ${endpoint} failed:`, error);
            throw error;
        }
    }

    // --- Auth ---

    async login(email, password) {
        // OAuth2 login expects form data
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const data = await this.request('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    }

    async signup(userData) {
        const data = await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    async getMe() {
        return await this.request('/auth/me');
    }

    // --- Chat ---

    async chat(message, sessionId = null) {
        return await this.request('/conversations/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });
    }

    // --- Admin ---
    async getStats() {
        return await this.request('/admin/stats');
    }

    // --- Reservations ---
    async getReservations() {
        return await this.request('/reservations');
    }

    // --- Rooms ---

    async getRooms() {
        return await this.request('/hotel/rooms');
    }

    async createRoom(roomData) {
        return await this.request('/hotel/rooms', {
            method: 'POST',
            body: JSON.stringify(roomData)
        });
    }

    async getCategories() {
        return await this.request('/hotel/categories');
    }

    async uploadRoomImage(roomId, file) {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseUrl}/hotel/rooms/${roomId}/upload_image`;
        const token = localStorage.getItem('token');
        const options = {
            method: 'POST',
            body: formData,
            headers: {} // Don't set Content-Type, fetch sets it automatically with boundary for FormData
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || data.message || `API Error: ${response.status}`);
            return data;
        } catch (error) {
            console.error(`Upload failed:`, error);
            throw error;
        }
    }
}

// Export for use in other scripts
const apiService = new ApiService();
