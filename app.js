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

        // ========== Blog Data ==========
        const BLOG_POSTS = [
            {
                id: 1,
                title: 'Why Boutique Hotels Are Redefining Luxury Travel in 2025',
                tag: 'Lifestyle Trends Blog',
                date: '12 Sep 2025',
                readTime: '4 min read',
                gradient: 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)'
            },
            {
                id: 2,
                title: '5 Essential Things to Look for When Booking a Hotel for Business',
                tag: 'Hotel Tips | Planning',
                date: '12 Sep 2025',
                readTime: '5 min read',
                gradient: 'linear-gradient(135deg, #6BB6C9 0%, #8BCDE0 100%)'
            },
            {
                id: 3,
                title: "A Weekend at The Langham: Gold Coast's Newest Luxury Gem",
                tag: 'Longitude Review',
                date: '12 Sep 2025',
                readTime: '6 min read',
                gradient: 'linear-gradient(135deg, #7AC5D8 0%, #9AD5E5 100%)'
            },
            {
                id: 4,
                title: 'Top 10 Beachfront Hotels Perfect for Your Next Escape',
                tag: 'Travel Guide',
                date: '10 Sep 2025',
                readTime: '7 min read',
                gradient: 'linear-gradient(135deg, #87CEEB 0%, #A0D8E8 100%)'
            },
            {
                id: 5,
                title: 'Sustainable Luxury: Eco-Friendly Hotels Worth Visiting',
                tag: 'Green Travel',
                date: '08 Sep 2025',
                readTime: '5 min read',
                gradient: 'linear-gradient(135deg, #6FB8D0 0%, #8FD0E2 100%)'
            }
        ];

        // ========== OOP Architecture ==========

        // Hotel Model
        class Hotel {
            constructor(id, name, price, location, rating, imageGradient) {
                this.id = id;
                this.name = name;
                this.price = price;
                this.location = location;
                this.rating = rating;
                this.imageGradient = imageGradient;
            }

            toHTML() {
                return `
                    <div class="hotel-card" data-id="${this.id}">
                        <div class="hotel-image" style="background: ${this.imageGradient}">
                            <div class="rating">${this.rating}</div>
                        </div>
                        <div class="hotel-info">
                            <div class="hotel-name">${this.name}</div>
                            <div class="hotel-price">$${this.price.toLocaleString()}</div>
                            <div class="hotel-location">${this.location}</div>
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

        // Chatbot Controller
        class ChatBot {
            constructor() {
                this.geminiService = new GeminiService(GEMINI_CONFIG.apiKey, GEMINI_CONFIG.apiUrl);
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
                // Construction du prompt contextuel pour Gemini
                const context = this.conversationHistory
                    .filter(msg => msg.role !== 'system')
                    .map(msg => `${msg.role === 'user' ? 'Client' : 'Assistant'}: ${msg.content}`)
                    .join('\n');

                const fullPrompt = `${this.geminiService.buildSystemPrompt()}

HISTORIQUE DE CONVERSATION :
${context}

Client: ${message}

Réponds maintenant en tant qu'assistant (maximum 4 phrases) :`;

                // Appel à Gemini API
                const response = await this.geminiService.generateResponse(fullPrompt);
                return response;
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
                this.loadHotels();
                this.renderHotels();
                this.renderBlogs();
                this.setupEventListeners();
                this.setupFAQ();
                this.initChatbot();
            }

            loadHotels() {
                this.hotels = [
                    new Hotel(
                        1,
                        'The Ritz-Carlton, Melbourne',
                        1240000,
                        'Mabbin, Australia',
                        5.0,
                        'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)'
                    ),
                    new Hotel(
                        2,
                        'The Langham, Gold Coast',
                        1240000,
                        'Mabbin, Australia',
                        5.0,
                        'linear-gradient(135deg, #6BB6C9 0%, #8BCDE0 100%)'
                    ),
                    new Hotel(
                        3,
                        'Longitude 131°, Uluru',
                        1240000,
                        'Mabbin, Australia',
                        5.0,
                        'linear-gradient(135deg, #87CEEB 0%, #A0D8E8 100%)'
                    ),
                    new Hotel(
                        4,
                        'Qualia Resort, Hamilton Island',
                        1450000,
                        'Whitsundays, Australia',
                        5.0,
                        'linear-gradient(135deg, #7AC5D8 0%, #9AD5E5 100%)'
                    ),
                    new Hotel(
                        5,
                        'The Peninsula, Sydney',
                        1680000,
                        'Sydney, Australia',
                        5.0,
                        'linear-gradient(135deg, #6FB8D0 0%, #8FD0E2 100%)'
                    )
                ];
            }

            renderHotels() {
                const grid = document.getElementById('hotelsGrid');
                grid.innerHTML = this.hotels.slice(0, 3).map(hotel => hotel.toHTML()).join('');
            }

            renderBlogs() {
                const grid = document.getElementById('blogGrid');
                const blogsToShow = this.blogPosts.slice(this.currentBlogIndex, this.currentBlogIndex + 3);
                
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

                // Setup carousel for desktop
                if (window.innerWidth > 768) {
                    this.setupCarousel();
                }

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
