import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import apiService from '../services/apiService';
import { useCurrentUser, getUserDisplayName, getUserInitials, getUserRole } from '../hooks/useCurrentUser';

export default function Assistant() {
  const user = useCurrentUser();
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: "Hello! Welcome to SkyBlue Hotel. I am your intelligent assistant. How can I help you with your stay today?" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');

    try {
      const response = await apiService.chat(userMessage);
      setMessages(prev => [...prev, { sender: 'assistant', text: response.reply || response.text || "I'm sorry, I cannot answer right now." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'assistant', text: "Server error while generating a response." }]);
    }
  };

  return (
    <div className="admin-container" style={{display: 'flex'}}>
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)'}}>AI Concierge Assistant</h1>
            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Intelligent support for your hotel operations</p>
          </div>
          <div className="header-right">
            <div className="user-profile" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.9rem', fontWeight: 600}}>{getUserDisplayName(user)}</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{getUserRole(user)}</div>
              </div>
              <div className="user-avatar" style={{width: '40px', height: '40px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>{getUserInitials(user)}</div>
            </div>
          </div>
        </header>

        <section className="chat-interface-wrapper" style={{background: 'white', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-premium)', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column'}}>
          <header className="chat-inner-header" style={{paddingBottom: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)'}}></div>
              <h2 style={{fontSize: '1.1rem', fontWeight: 700}}>Live AI Agent</h2>
            </div>
          </header>

        <div id="chat-messages" style={{height: '60vh', overflowY: 'auto', marginBottom: '20px', padding: '10px'}}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`} style={{
              background: msg.sender === 'user' ? '#e1f5fe' : '#f5f5f5', 
              padding: '10px 15px', 
              borderRadius: '10px', 
              marginBottom: '10px',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              width: 'fit-content',
              marginLeft: msg.sender === 'user' ? 'auto' : '0'
            }}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form id="chat-form" onSubmit={handleSend} style={{display: 'flex', gap: '10px'}}>
            <div className="input-wrapper" style={{flex: 1}}>
              <input 
                type="text" 
                id="user-input" 
                placeholder="Type your request here (e.g., 'Book a deluxe room' or 'Report an issue')..." 
                autoComplete="off"
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ccc'}}
              />
            </div>
            <button type="submit" id="send-btn" style={{padding: '0 10px', borderRadius: '10px', background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer'}}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
        </section>
      </div>
    </div>
  );
}
