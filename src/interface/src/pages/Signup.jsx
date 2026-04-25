import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await apiService.signup({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{maxWidth: '600px'}}>
        <header className="auth-header">
          <h2>Create Account</h2>
          <p className="subtitle">Join SkyBlue Hotel’s exclusive member club</p>
        </header>

        {error && <p style={{color: 'var(--error)', textAlign: 'center', marginBottom: '1rem', fontWeight: 600}}>{error}</p>}

        <form onSubmit={handleSignup} className="premium-form">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group-premium">
              <label>First Name</label>
              <input type="text" name="firstName" className="premium-input" placeholder="John" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group-premium">
              <label>Last Name</label>
              <input type="text" name="lastName" className="premium-input" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group-premium">
            <label>Email Address</label>
            <input type="email" name="email" className="premium-input" placeholder="name@company.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group-premium">
            <label>Phone Number</label>
            <input type="tel" name="phone" className="premium-input" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group-premium">
            <label>Create Password</label>
            <input type="password" name="password" className="premium-input" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-premium-auth">Create Account</button>
        </form>

        <p className="auth-footer">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
