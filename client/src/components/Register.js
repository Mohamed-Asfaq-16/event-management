import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    console.log(formData);
    const result = await onRegister(formData.name, formData.email, formData.password, formData.role);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <h1>Join Our Platform</h1>
          <p>
            Create your account to start managing and discovering events. 
            Register now to access our comprehensive event management system 
            and connect with exciting opportunities.
          </p>
        </div>
        <div className="login-right">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Register</h2>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success">
                Registration successful! Redirecting to login...
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password (min 6 characters)"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Role
              </label>
            <label className="check-admin">
              <input 
              type="radio" 
              name="role" 
              value="admin"
              checked={formData.role === 'admin'}
              onChange={handleChange}
              />
              admin
            </label>
            <label className="check-admin">
              <input 
              type="radio" 
              name="role" 
              value="user"
              checked={formData.role === 'user'}
              onChange={handleChange}
              />
              user
            </label>
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            
            <div className="register-link">
              <p>
                Already have an account?{' '}
                <Link to="/">Login here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 