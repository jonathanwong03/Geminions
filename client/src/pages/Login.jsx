import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/login', { email, password });
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGoogleLogin = () => {
    // Use the same server URL logic as configured in main.jsx
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    window.location.href = `${serverUrl}/auth/google`;
  };

  return (
    <div className="auth-wrapper auth-bg-yellow">
      <div className="minion-card auth-card">
        <h1 style={{ color: 'var(--minion-blue)' }}>Bello! Login</h1>
        <p>Sign in to start creating awesome designs!</p>
        
        <button onClick={handleGoogleLogin} className="btn-primary w-full mb-1" style={{ background: '#DB4437' }}>
          Sign in with Google
        </button>

        <div className="divider-container">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
        </div>

        <form onSubmit={handleLogin} className="form-group">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn-primary">Log In</button>
        </form>

        <p className="mt-1">
          New here? <Link to="/register" style={{ color: 'var(--minion-blue)', fontWeight: 'bold' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
