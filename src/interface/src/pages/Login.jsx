import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await apiService.login(email, password);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to your SkyBlue account</p>
        </header>

        {error && <p style={{color: 'var(--error)', textAlign: 'center', marginBottom: '1rem', fontWeight: 600}}>{error}</p>}

        <form onSubmit={handleLogin} className="premium-form">
          <div className="form-group-premium">
            <label>Email Address</label>
            <input 
              type="email" 
              className="premium-input"
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group-premium">
            <label>Password</label>
            <input 
              type="password" 
              className="premium-input"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{textAlign: 'right'}}>
            <a href="#" style={{fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none'}}>Forgot password?</a>
          </div>

          <button type="submit" className="btn-premium-auth">Sign In</button>
        </form>

        <div className="social-auth">
          <div className="social-icon"><i className="fa-brands fa-google"></i></div>
          <div className="social-icon"><i className="fa-brands fa-apple"></i></div>
          <div className="social-icon"><i className="fa-brands fa-facebook-f"></i></div>
        </div>

        <p className="auth-footer">
          Don’t have an account?
          <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
}
