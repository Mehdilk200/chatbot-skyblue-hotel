/**
 * SkyBlue Hotel Assistant - Client Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    // Generate a simple session ID if not present
    let sessionId = localStorage.getItem('skyblue_sessionId');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('skyblue_sessionId', sessionId);
    }

    // Function to append messages to the UI
    function appendMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role);
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // 1. Add user message to UI
        appendMessage('user', message);
        userInput.value = '';

        // 2. Show loading state (subtle)
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'assistant');
        loadingDiv.style.opacity = '0.5';
        loadingDiv.textContent = 'Thinking...';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // 3. Send to FastAPI backend using ApiService
            const data = await apiService.chat(message, sessionId);

            // 4. Remove loading and add assistant response
            chatMessages.removeChild(loadingDiv);
            
            appendMessage('assistant', data.reply || data.text || "Sorry, I couldn't process that.");

        } catch (error) {
            chatMessages.removeChild(loadingDiv);
            appendMessage('assistant', "Connection error. Is the server running?");
            console.error("Chat error:", error);
        }
    });

    // Add interactivity to sidebar items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelector('.nav-item.active').classList.remove('active');
            item.classList.add('active');
        });
    });
});
