/**
 * ApiService - Centralized service for backend communication
 */
class ApiService {
    // Use relative URLs so Vite proxy handles routing in dev,
    // and the base can be overridden for production builds.
    constructor(baseUrl = '') {
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

    async chat(message, sessionId = null, imageBase64 = null) {
        return await this.request('/conversations/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                sessionId: sessionId,
                image_base64: imageBase64
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

    async createReservation(reservationData) {
        return await this.request('/reservations', {
            method: 'POST',
            body: JSON.stringify(reservationData)
        });
    }

    // --- Services ---
    async getServices() {
        return await this.request('/services');
    }

    async createService(serviceData) {
        return await this.request('/services', {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });
    }

    // --- Complaints ---
    async getComplaints(clientId = null) {
        const qs = clientId ? `?client_id=${clientId}` : '';
        return await this.request(`/complaints${qs}`);
    }

    async createComplaint(complaintData) {
        return await this.request('/complaints', {
            method: 'POST',
            body: JSON.stringify(complaintData)
        });
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

    async getFloors() {
        return await this.request('/hotel/floors');
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

// Export for use in React components
const apiService = new ApiService();
export default apiService;
