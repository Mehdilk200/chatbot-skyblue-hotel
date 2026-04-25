import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="brand-icon"><i className="fas fa-crown" style={{ fontSize: '2.5rem', color: 'var(--accent)' }}></i></span>
          <h2>SkyBlue Hotel</h2>
          <p>Luxury Redefined</p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#rooms">Rooms &amp; Suites</a>
            <a href="#facilities">Facilities</a>
            <a href="#about">About Us</a>
          </div>
          
          <div className="link-group">
            <h4>Support</h4>
            <a href="#">FAQ</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Contact Us</a>
          </div>
          
          <div className="link-group">
            <h4>Contact Info</h4>
            <p><i className="fas fa-map-marker-alt"></i> 3891 Ranchview Dr, California</p>
            <p><i className="fas fa-phone"></i> +212 6 9998880</p>
            <p><i className="fas fa-envelope"></i> info@skybluehotel.com</p>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SkyBlue Hotel. All rights reserved.</p>
        <div className="social-links">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-linkedin-in"></i></a>
        </div>
      </div>
    </footer>
  );
}
