<<<<<<< HEAD:app.js
// Environment Configuration with Fallbacks
const GEMINI_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY 
    apiUrl: process.env.GEMINI_API_URL 
};

// Environment Detection
const ENV = {
    isDevelopment: process.env.NODE_ENV === 'development',
    debug: process.env.DEBUG === 'true'
};

// Security Notice (Development only)
if (ENV.isDevelopment && ENV.debug) {
    console.log('Development Mode: Using environment variables for API configuration');
    console.log(' Warning: API key is hardcoded for development. Move to production environment for security.');
}
=======
// Configuration is now handled through ApiService
>>>>>>> 4ffb3cc (add confication):src/UI/js/app.js

        // ========== Blog Data ==========
        const BLOG_POSTS = []; // Removed static blog posts


        // ========== OOP Architecture ==========

        class Hotel {
            constructor(id, name, price, location, rating, image) {
                this.id = id;
                this.name = name;
                this.price = price;
                this.location = location;
                this.rating = rating;
                this.image = image || 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)';
            }

            toHTML() {
                const imgStyle = this.image.startsWith('http') || this.image.startsWith('/') 
                                 ? `background: url(${this.image}) center/cover no-repeat;` 
                                 : `background: ${this.image}`;
                return `
                    <div class="hotel-card" data-id="${this.id}">
                        <div class="hotel-image" style="${imgStyle}">
                            <div class="rating">${this.rating || 'New'}</div>
                        </div>
                        <div class="hotel-info">
                            <div class="hotel-name">${this.name}</div>
                            <div class="hotel-price">$${this.price ? this.price.toLocaleString() : 'N/A'}</div>
                            <div class="hotel-location">${this.location || 'Location Not Specified'}</div>
                        </div>
                    </div>
                `;
            }
        }

        // Reservation Model
        class Reservation {
            constructor() {
                this.city = null;
                this.checkIn = null;
                this.checkOut = null;
                this.guests = null;
                this.hotel = null;
            }

            isComplete() {
                return this.city && this.checkIn && this.checkOut && this.guests;
            }

            getSummary() {
                return `Réservation pour ${this.guests} personne(s) à ${this.city} du ${this.checkIn} au ${this.checkOut}`;
            }
        }

<<<<<<< HEAD:app.js
        // Gemini API Service
        class GeminiService {
            constructor(apiKey, apiUrl) {
                this.apiKey = apiKey;
                this.apiUrl = apiUrl;
                this.isConfigured = this.checkConfiguration();
            }

            checkConfiguration() {
                const hasApiKey = this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY_HERE' && !this.apiKey.startsWith('YOUR_');
                const hasApiUrl = this.apiUrl && this.apiUrl.includes('googleapis.com');
                
                if (!hasApiKey) {
                    console.warn(' API key not configured properly');
                }
                
                return hasApiKey && hasApiUrl;
            }

            async generateResponse(prompt) {
                if (!this.isConfigured) {
                    console.warn('API not configured properly. Using fallback responses.');
                    return this.getFallbackResponse(prompt);
                }

                try {
                    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: prompt
                                }]
                            }],
                            generationConfig: {
                                temperature: 0.2,
                                topK: 40,
                                topP: 0.95,
                                maxOutputTokens: 1024,
                            }
                        })
                    });

                    if (!response.ok) {
                        throw new Error(` API Error: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                        return data.candidates[0].content.parts[0].text;
                    }
                    
                    return this.getFallbackResponse(prompt);
                    
                } catch (error) {
                    console.error('API Error:', error);
                    return this.getFallbackResponse(prompt);
                }
            }

            getFallbackResponse(prompt) {
                const lower = prompt.toLowerCase();
                
                // Détection de la ville
                if (lower.includes('ville') || lower.includes('city') || !lower.match(/\d/)) {
                    return "Excellent choix ! Quand souhaitez-vous arriver ? (Format : JJ/MM/AAAA ou AAAA-MM-JJ)";
                }
                
                // Détection de date
                if (lower.match(/\d{2}\/\d{2}\/\d{4}/) || lower.match(/\d{4}-\d{2}-\d{2}/)) {
                    if (lower.includes('départ') || lower.includes('checkout')) {
                        return "Parfait ! Combien de personnes voyageront avec vous ?";
                    }
                    return "Super ! Et quand prévoyez-vous de partir ? (Date de départ)";
                }
                
                // Détection du nombre de personnes
                if (lower.match(/\d+\s*(personne|guest|people|person)/i) || 
                    (lower.match(/^\d+$/) && parseInt(lower) < 20)) {
                    return "Parfait ! 🎉\n\nVoici mes meilleures recommandations pour vous :\n\n🏨 The Ritz-Carlton, Melbourne - 1 240 000 DH/nuit\n⭐ Note : 5.0 | 📍 Mabbin, Australia\n\n🏨 The Langham, Gold Coast - 1 240 000 DH/nuit\n⭐ Note : 5.0 | 📍 Mabbin, Australia\n\n🏨 Longitude 131°, Uluru - 1 240 000 DH/nuit\n⭐ Note : 5.0 | 📍 Mabbin, Australia\n\nSouhaitez-vous réserver l'un de ces hôtels ?";
                }
                
                // Confirmation
                if (lower.includes('oui') || lower.includes('yes') || lower.includes('réserv')) {
                    return "Magnifique ! 🎊 Votre réservation est confirmée !\n\nVous recevrez un email de confirmation sous peu avec tous les détails.\n\nPuis-je vous aider pour autre chose ?";
                }
                
                // Reset
                if (lower.includes('non') || lower.includes('no') || lower.includes('autre')) {
                    return "Pas de problème ! Dans quelle ville souhaitez-vous séjourner ?";
                }
                
                // Salutations
                if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello') || lower.includes('hi')) {
                    return "Bonjour ! 👋 Bienvenue chez Stayava. Je suis votre assistant de réservation. Dans quelle ville souhaitez-vous séjourner ?";
                }
                
                return "Je comprends. Pour vous aider au mieux, j'ai besoin de quelques informations : la ville, les dates d'arrivée et de départ, et le nombre de personnes.";
            }

            buildSystemPrompt() {
                return `Tu es un assistant de réservation d'hôtels de luxe pour Stayava. 

RÔLE :
- Tu aides les clients à réserver des hôtels de luxe
- Tu es professionnel, chaleureux et efficace
- Tu poses des questions claires et précises

INFORMATIONS À COLLECTER (dans l'ordre) :
1. Ville de destination
2. Date d'arrivée
3. Date de départ
4. Nombre de personnes

HÔTELS DISPONIBLES :
- The Ritz-Carlton, Melbourne : 1 240 000 DH/nuit (5.0⭐) - Mabbin, Australia
- The Langham, Gold Coast : 1 240 000 DH/nuit (5.0⭐) - Mabbin, Australia
- Longitude 131°, Uluru : 1 240 000 DH/nuit (5.0⭐) - Mabbin, Australia
- Qualia Resort, Hamilton Island : 1 450 000 DH/nuit (5.0⭐) - Whitsundays, Australia
- The Peninsula, Sydney : 1 680 000 DH/nuit (5.0⭐) - Sydney, Australia

INSTRUCTIONS :
- Sois concis (maximum 3-4 phrases)
- Utilise des emojis avec modération (🏨 ⭐ 📍 🎉)
- Une fois toutes les infos collectées, propose 2-3 hôtels adaptés
- Confirme la réservation si le client accepte
- Reste naturel et conversationnel

Réponds de manière professionnelle et engageante.`;
            }
        }
=======
        // Gemini API is now handled by the backend through ApiService
>>>>>>> 4ffb3cc (add confication):src/UI/js/app.js

        // Chatbot Controller
        class ChatBot {
            constructor() {
                this.reservation = new Reservation();
                this.conversationHistory = [];
                this.messagesContainer = document.getElementById('chatbotMessages');
                this.inputField = document.getElementById('chatInput');
                this.currentStep = 'greeting';
                
                this.init();
            }

            init() {
                const welcomeMsg = "Bonjour ! 👋 Bienvenue chez Stayava. Je suis votre assistant de réservation personnalisé. Dans quelle ville souhaitez-vous séjourner ?";
                this.addMessage('bot', welcomeMsg);
                this.conversationHistory.push({
                    role: 'system',
                    content: this.geminiService.buildSystemPrompt()
                });
            }

            addMessage(sender, text) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}`;
                messageDiv.textContent = text;
                this.messagesContainer.appendChild(messageDiv);
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }

            showTyping() {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'typing-indicator';
                typingDiv.innerHTML = '<span></span><span></span><span></span>';
                typingDiv.id = 'typing';
                this.messagesContainer.appendChild(typingDiv);
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }

            hideTyping() {
                const typing = document.getElementById('typing');
                if (typing) typing.remove();
            }

            async handleUserMessage(message) {
                this.addMessage('user', message);
                this.showTyping();

                this.conversationHistory.push({
                    role: 'user',
                    content: message
                });

                setTimeout(async () => {
                    const response = await this.processMessage(message);
                    this.hideTyping();
                    this.addMessage('bot', response);
                    
                    this.conversationHistory.push({
                        role: 'assistant',
                        content: response
                    });
                }, 1200);
            }

            async processMessage(message) {
                try {
                    const data = await apiService.chat(message);
                    return data.reply || data.text || "Désolé, je ne peux pas répondre pour le moment.";
                } catch (error) {
                    console.error("Chat error:", error);
                    return "Désolé, une erreur est survenue lors de la communication avec le serveur.";
                }
            }
        }

        // UI Controller
        class UIController {
            constructor() {
                this.hotels = [];
                this.blogPosts = BLOG_POSTS;
                this.currentBlogIndex = 0;
                this.chatbot = null;
                this.init();
            }

            init() {
                this.loadHotels().then(() => {
                    this.renderHotels();
                    // Setup carousel after hotels are loaded
                    if (window.innerWidth > 768) {
                        this.setupCarousel();
                    }
                });
                this.renderBlogs();
                this.setupEventListeners();
                this.setupFAQ();
                this.initChatbot();
                this.setupUserUI();
            }

            setupUserUI() {
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const adminLinks = document.querySelectorAll('.admin-only');
                const userLinks = document.querySelectorAll('.user-only');
                const authBtns = document.getElementById('auth-buttons');
                const userProfile = document.getElementById('user-profile');

                if (user) {
                    if (authBtns) authBtns.style.display = 'none';
                    if (userProfile) {
                        userProfile.style.display = 'flex';
                        userProfile.innerHTML = `<span class="user-name">Hello, ${user.first_name}</span><button onclick="apiService.logout(); window.location.reload();" class="btn-login" style="margin-left: 1rem;">Logout</button>`;
                    }
                    if (user.role === 'admin') {
                        adminLinks.forEach(l => l.style.display = 'block');
                    } else {
                        adminLinks.forEach(l => l.style.display = 'none');
                    }
                } else {
                    if (authBtns) authBtns.style.display = 'flex';
                    if (userProfile) userProfile.style.display = 'none';
                    adminLinks.forEach(l => l.style.display = 'none');
                    userLinks.forEach(l => l.style.display = 'none');
                }
            }

            async loadHotels() {
                try {
                     const rooms = await apiService.getRooms();
                     this.hotels = rooms.map(r => new Hotel(
                         r._id,
                         `Room ${r.number}`,
                         r.price || 150, // default if no price
                         'SkyBlue Hotel',
                         5.0,
                         r.images && r.images.length > 0 ? r.images[0] : 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)'
                     ));
                } catch(e) {
                     console.error("Failed to load rooms, using defaults", e);
                     this.hotels = [];
                }
            }

            renderHotels() {
                const grid = document.getElementById('hotelsGrid');
                grid.innerHTML = this.hotels.slice(0, 3).map(hotel => hotel.toHTML()).join('');
            }

            renderBlogs() {
                const grid = document.getElementById('blogGrid');
                if (!grid) return;
                const blogsToShow = this.blogPosts.slice(this.currentBlogIndex, this.currentBlogIndex + 3);
                
                if (blogsToShow.length === 0) {
                    grid.innerHTML = '<p style="text-align:center; color:#aaa; width:100%;">No blog posts available.</p>';
                    return;
                }

                grid.innerHTML = blogsToShow.map(post => `
                    <div class="blog-card" data-id="${post.id}">
                        <div class="blog-image" style="background: ${post.gradient}"></div>
                        <div class="blog-content">
                            <div class="blog-meta">
                                <span class="blog-tag">${post.tag}</span>
                                <span class="blog-date">${post.date}</span>
                                <span class="blog-read-time">${post.readTime}</span>
                            </div>
                            <div class="blog-title">${post.title}</div>
                        </div>
                    </div>
                `).join('');
            }

            setupFAQ() {
                const faqItems = document.querySelectorAll('.faq-item');
                
                faqItems.forEach(item => {
                    const question = item.querySelector('.faq-question');
                    
                    question.addEventListener('click', () => {
                        const isActive = item.classList.contains('active');
                        
                        // Close all items
                        faqItems.forEach(otherItem => {
                            otherItem.classList.remove('active');
                            const icon = otherItem.querySelector('.faq-icon');
                            icon.textContent = '+';
                        });
                        
                        // Toggle current item
                        if (!isActive) {
                            item.classList.add('active');
                            const icon = item.querySelector('.faq-icon');
                            icon.textContent = '−';
                        }
                    });
                });
            }

            setupEventListeners() {
                // Menu Toggle (Mobile)
                const menuToggle = document.getElementById('menuToggle');
                const navLinks = document.getElementById('navLinks');
                
                menuToggle.addEventListener('click', () => {
                    menuToggle.classList.toggle('active');
                    navLinks.classList.toggle('active');
                });

                // Close menu when clicking on a link
                navLinks.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        menuToggle.classList.remove('active');
                        navLinks.classList.remove('active');
                    });
                });

                // Chatbot toggle
                const toggle = document.getElementById('chatbotToggle');
                const chatWindow = document.getElementById('chatbotWindow');
                const close = document.getElementById('chatbotClose');
                const sendBtn = document.getElementById('sendBtn');
                const input = document.getElementById('chatInput');

                toggle.addEventListener('click', () => {
                    chatWindow.classList.add('active');
                    input.focus();
                });

                close.addEventListener('click', () => {
                    chatWindow.classList.remove('active');
                });

                sendBtn.addEventListener('click', () => this.sendMessage());
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessage();
                    }
                });

                // Smooth scroll
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', (e) => {
                        e.preventDefault();
                        const target = document.querySelector(anchor.getAttribute('href'));
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                });

                // Hotel card clicks
                document.addEventListener('click', (e) => {
                    const card = e.target.closest('.hotel-card');
                    if (card) {
                        const hotelId = parseInt(card.dataset.id);
                        const hotel = this.hotels.find(h => h.id === hotelId);
                        if (hotel) {
                            this.showHotelDetails(hotel);
                        }
                    }
                });

                // Carousel is setup in init now since it has to wait for loadHotels.

                // Blog navigation
                const blogPrev = document.getElementById('blogPrev');
                const blogNext = document.getElementById('blogNext');

                if (blogPrev && blogNext) {
                    blogPrev.addEventListener('click', () => {
                        if (this.currentBlogIndex > 0) {
                            this.currentBlogIndex--;
                            this.renderBlogs();
                        }
                    });

                    blogNext.addEventListener('click', () => {
                        if (this.currentBlogIndex + 3 < this.blogPosts.length) {
                            this.currentBlogIndex++;
                            this.renderBlogs();
                        }
                    });
                }
            }

            setupCarousel() {
                const grid = document.getElementById('hotelsGrid');
                let currentIndex = 0;

                const updateCarousel = () => {
                    const startIndex = currentIndex * 3;
                    const endIndex = startIndex + 3;
                    const hotelsToShow = this.hotels.slice(startIndex, endIndex);
                    
                    if (hotelsToShow.length > 0) {
                        grid.innerHTML = hotelsToShow.map(hotel => hotel.toHTML()).join('');
                    }
                };

                // Create arrows if not exist
                const parentElement = grid.parentElement;
                if (!parentElement.querySelector('.nav-arrows')) {
                    const arrows = document.createElement('div');
                    arrows.className = 'nav-arrows';
                    arrows.innerHTML = `
                        <div class="arrow arrow-left">‹</div>
                        <div class="arrow arrow-right">›</div>
                    `;
                    parentElement.style.position = 'relative';
                    parentElement.appendChild(arrows);

                    const leftArrow = arrows.querySelector('.arrow-left');
                    const rightArrow = arrows.querySelector('.arrow-right');

                    leftArrow.addEventListener('click', () => {
                        if (currentIndex > 0) {
                            currentIndex--;
                            updateCarousel();
                        }
                    });

                    rightArrow.addEventListener('click', () => {
                        const maxIndex = Math.ceil(this.hotels.length / 3) - 1;
                        if (currentIndex < maxIndex) {
                            currentIndex++;
                            updateCarousel();
                        }
                    });
                }
            }

            initChatbot() {
                this.chatbot = new ChatBot();
            }

            sendMessage() {
                const input = document.getElementById('chatInput');
                const message = input.value.trim();
                
                if (message) {
                    this.chatbot.handleUserMessage(message);
                    input.value = '';
                }
            }

            showHotelDetails(hotel) {
                const chatWindow = document.getElementById('chatbotWindow');
                chatWindow.classList.add('active');
                
                setTimeout(() => {
                    this.chatbot.addMessage('bot', 
                        `Excellent choix ! 🏨\n\n${hotel.name}\n💰 ${hotel.price.toLocaleString()} DH/nuit\n⭐ ${hotel.rating}/5\n📍 ${hotel.location}\n\nSouhaitez-vous réserver cet hôtel ? Si oui, indiquez-moi vos dates d'arrivée et de départ.`
                    );
                    this.chatbot.reservation.hotel = hotel;
                    
                    const input = document.getElementById('chatInput');
                    input.focus();
                }, 500);
            }
        }

        // Initialize Application
        document.addEventListener('DOMContentLoaded', () => {
            const app = new UIController();
            
            // Scroll animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.hotel-card, .feature-card, .confidence-item').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'all 0.6s ease';
                observer.observe(el);
            });

            // Parallax effect for hero
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const scrolled = window.pageYOffset;
                        const hero = document.querySelector('.hero-content');
                        if (hero && scrolled < window.innerHeight) {
                            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                            hero.style.opacity = Math.max(0, 1 - (scrolled / 600));
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            console.log(' Stayava Hotel Booking System Initialized');
            console.log(' Chatbot powered by Gemini AI');
            console.log(' ' + app.hotels.length + ' luxury hotels available');
            console.log(' Fully responsive design');
        });
