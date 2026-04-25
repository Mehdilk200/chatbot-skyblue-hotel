import { useState, useEffect, useRef } from 'react';
import apiService from '../services/apiService';
import { FaCalendarAlt, FaMoneyBillWave, FaSwimmingPool, FaPhone } from "react-icons/fa";

export default function HotelChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Welcome to SkyBlue Hotel! I'm your intelligent hotel assistant. How can I help you today?", time: 'Just now' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    const el = document.getElementById('chatbotMessages');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage = input.trim();
    const imageToSend = selectedImage;
    
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userMessage, 
      image: imageToSend,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }]);
    
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setIsTyping(true);

    try {
      let base64String = null;
      if (imageToSend) {
        base64String = imageToSend.split(',')[1];
      }
      
      const response = await apiService.chat(userMessage, null, base64String);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: response.reply || response.text || "Sorry, I cannot respond at the moment. Please try again.",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "Communication error with server. Please try again.", time: 'Now' }]);
    }
  };

  const handleQuickReply = (text) => {
    setInput(text);
  };

  return (
    <div className="hotel-chatbot">
      <div className="chatbot-toggle" id="chatbotToggle" onClick={() => setIsOpen(true)}>
        <div className="chatbot-avatar">
          <i className="fas fa-concierge-bell"></i>
        </div>
        <span className="chatbot-label">Hotel Assistant</span>
      </div>

      <div className={`chatbot-window ${isOpen ? 'active' : ''}`} id="chatbotWindow">
        <div className="chatbot-header">
          <div className="header-info">
            <div className="chatbot-avatar">
              <i className="fas fa-concierge-bell"></i>
            </div>
            <div>
              <h3>SkyBlue Concierge</h3>
              <p className="status">🟢 Online — 24/7 Available</p>
            </div>
          </div>
          <button className="chatbot-close" id="chatbotClose" onClick={() => setIsOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="chatbot-messages" id="chatbotMessages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender} ${i === 0 ? 'welcome' : ''}`}>
              {msg.sender === 'bot' && (
                <div className="message-header">
                  <strong>SkyBlue:</strong> <span className="time">{msg.time}</span>
                </div>
              )}
              <p>{msg.text}</p>
              {msg.image && (
                <img src={msg.image} alt="Uploaded" className="message-image" />
              )}
              {i === 0 && (
                <div className="quick-replies">
                  <button className="quick-btn" onClick={() => handleQuickReply('Book a room')}>
                    <FaCalendarAlt /> Book a room
                  </button>
                  <button className="quick-btn" onClick={() => handleQuickReply('Room prices')}>
                    <FaMoneyBillWave /> Room prices
                  </button>
                  <button className="quick-btn" onClick={() => handleQuickReply('Hotel facilities')}>
                    <FaSwimmingPool /> Hotel facilities
                  </button>
                  <button className="quick-btn" onClick={() => handleQuickReply('Contact hotel')}>
                    <FaPhone /> Contact hotel
                  </button>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator" id="typing">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>

        <div className="chatbot-input" style={{ position: 'relative' }}>
          {selectedImage && (
            <div className="image-preview-container">
              <img src={selectedImage} alt="Preview" className="image-preview-thumb" />
              <button className="image-preview-remove" onClick={() => {
                setSelectedImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
            <i className="fas fa-paperclip"></i>
          </button>
          <input
            type="text"
            id="chatInput"
            placeholder="Ask about booking, facilities..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button id="sendBtn" onClick={handleSend}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
