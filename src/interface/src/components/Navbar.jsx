import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

export default function Navbar() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`modern-nav ${isScrolled ? 'scrolled' : ''}`} style={{ zIndex: 1000 }}>
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon"><i className="fas fa-crown" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}></i></span>
          <span className="brand-text">SkyBlue</span>
        </div>
        
        <div className="nav-center">
          {/* Apply local inline styles to override the display:none on mobile when open */}
          <ul className="nav-menu" style={{ display: isMenuOpen ? 'flex' : undefined, flexDirection: isMenuOpen ? 'column' : undefined, position: isMenuOpen ? 'absolute' : undefined, top: isMenuOpen ? '100%' : undefined, left: isMenuOpen ? 0 : undefined, width: isMenuOpen ? '100%' : undefined, background: isMenuOpen ? 'rgba(255, 255, 255, 0.98)' : undefined, padding: isMenuOpen ? '20px' : undefined, boxShadow: isMenuOpen ? '0 10px 20px rgba(0,0,0,0.1)' : undefined }}>
            <li><a href="/#home" onClick={() => setIsMenuOpen(false)} className="nav-link active"><i className="fas fa-home"></i> Home</a></li>
            <li><a href="/#rooms" onClick={() => setIsMenuOpen(false)} className="nav-link"><i className="fas fa-bed"></i> Rooms</a></li>
            <li><a href="/#facilities" onClick={() => setIsMenuOpen(false)} className="nav-link"><i className="fas fa-swimming-pool"></i> Facilities</a></li>
            <li><a href="/#about" onClick={() => setIsMenuOpen(false)} className="nav-link"><i className="fas fa-info-circle"></i> About</a></li>
            <li><a href="/#contact" onClick={() => setIsMenuOpen(false)} className="nav-link"><i className="fas fa-phone"></i> Contact</a></li>
            {user?.role === 'admin' && (
              <li><Link to="/admin/rooms" onClick={() => setIsMenuOpen(false)} className="nav-link admin-only"><i className="fas fa-cogs"></i> Manage</Link></li>
            )}
          </ul>
        </div>
        
        <div className="nav-actions">
          <div className="nav-contact">
            <i className="fas fa-phone-alt"></i>
            <span>+212 6 9998880</span>
          </div>
          
          {!user ? (
            <div className="nav-buttons" id="auth-buttons">
              <Link to="/login" className="btn-login">
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link to="/signup" className="btn-signup">
                <i className="fas fa-user-plus"></i> Sign Up
              </Link>
            </div>
          ) : (
            <div className="nav-buttons" id="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="user-name">Hello, {user.first_name || user.email}</span>
              <button onClick={handleLogout} className="btn-login" style={{ marginLeft: '1rem' }}>
                Logout
              </button>
            </div>
          )}
          
          <div className="nav-toggle" id="navToggle" onClick={toggleMenu}>
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </div>
        </div>
      </div>
    </nav>
  );
}
