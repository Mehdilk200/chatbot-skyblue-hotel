// Hotel Chatbot JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const quickBtns = document.querySelectorAll('.quick-btn');
    
    // Hotel responses database
    const hotelResponses = {
        "Book a room": "🎉 **Booking Information:**\n\nYou can book through:\n• Website: www.stayava.com\n• Phone: +212 6 9998880\n• Email: booking@stayava.com\n\nWould you like to check availability for specific dates?",
        "Room prices": "💰 **Room Rates:**\n\n• **Deluxe Room**: $299/night\n• **Executive Suite**: $499/night\n• **Presidential Suite**: $899/night\n\n*All rates include breakfast and WiFi*",
        "Hotel facilities": "🏨 **Hotel Facilities:**\n\n🏊 Infinity Pool (7AM-10PM)\n💆 Luxury Spa & Wellness\n🏋️ 24/7 Fitness Center\n🍽️ 3 Restaurants & Bars\n🅿️ Valet Parking\n📶 Free WiFi\n🎯 Business Center",
        "Contact hotel": "📞 **Contact Us:**\n\n• Phone: +212 6 9998880\n• Email: info@stayava.com\n• WhatsApp: +212 6 9998880\n• Address: 3891 Ranchview Dr, California\n\n⏰ **24/7 Available**",
        "wifi": "Yes! Free high-speed WiFi throughout the hotel. Network: Stayava_Guest, Password: Welcome2025",
        "breakfast": "Breakfast is served from 6:30 AM to 11:00 AM daily. Included with all suite bookings.",
        "parking": "Complimentary valet parking available. Self-parking: $20/day.",
        "check": "Check-in: 2:00 PM\nCheck-out: 12:00 PM\n*Early check-in/late check-out subject to availability*",
        "spa": "Spa hours: 9:00 AM - 9:00 PM\nServices: Massages, Facials, Wellness Treatments\nReservations: Ext. 123",
        "pool": "Pool hours: 7:00 AM - 10:00 PM\nPoolside service: 9:00 AM - 9:00 PM\n*Children must be supervised*"
    };
    
    // Toggle chat window
    chatbotToggle.addEventListener('click', function() {
        chatbotWindow.style.display = chatbotWindow.style.display === 'none' ? 'flex' : 'none';
    });
    
    // Close chat window
    chatbotClose.addEventListener('click', function() {
        chatbotWindow.style.display = 'none';
    });
    
    // Quick reply buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const replyText = this.getAttribute('data-reply');
            addMessage('user', replyText);
            
            // Show typing effect
            showTyping();
            
            // Send response after delay
            setTimeout(() => {
                hideTyping();
                sendBotResponse(replyText);
            }, 1000);
        });
    });
    
    // Send message function
    function sendMessage() {
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message
            addMessage('user', message);
            
            // Clear input
            chatInput.value = '';
            
            // Show typing effect
            showTyping();
            
            // Send bot response after delay
            setTimeout(() => {
                hideTyping();
                sendBotResponse(message);
            }, 1500);
        }
    }
    
    // Send button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Enter key press
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add message to chat
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = `<strong>${sender === 'bot' ? 'Ava' : 'You'}:</strong> <span class="time">${getCurrentTime()}</span>`;
        
        const content = document.createElement('p');
        content.textContent = text;
        
        messageDiv.appendChild(header);
        messageDiv.appendChild(content);
        
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        return messageDiv;
    }
    
    // Show typing indicator
    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-header">
                <strong>Ava:</strong> <span class="time">typing...</span>
            </div>
            <p>...</p>
        `;
        
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTyping() {
        const typing = document.getElementById('typingIndicator');
        if (typing) {
            typing.remove();
        }
    }
    
    // Send bot response
    async function sendBotResponse(userMessage) {
        try {
            const data = await apiService.chat(userMessage);
            const response = data.reply || data.text || "I'm sorry, I couldn't process that.";
            addMessage('bot', response);
        } catch (error) {
            console.error("Chat error:", error);
            // Fallback to local logic if backend fails
            const message = userMessage.toLowerCase();
            let response = hotelResponses[userMessage] || "I'm having trouble connecting to my brain! Please try again later or contact our staff directly.";
            
            if (!hotelResponses[userMessage]) {
                if (message.includes('book') || message.includes('reservation')) {
                    response = hotelResponses["Book a room"];
                } else if (message.includes('price') || message.includes('cost')) {
                    response = hotelResponses["Room prices"];
                } // ... other local fallbacks could be added here
            }
            addMessage('bot', response);
        }
    }
    
    // Get current time
    function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Initialize chat window as visible
    chatbotWindow.style.display = 'flex';
    
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});