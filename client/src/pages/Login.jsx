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
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--minion-yellow)' }}>
      <div className="minion-card" style={{ width: '400px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--minion-blue)' }}>Bello! Login</h1>
        <p>Sign in to start creating awesome designs!</p>
        
        <button onClick={handleGoogleLogin} className="btn-primary" style={{ width: '100%', marginBottom: '1rem', background: '#DB4437' }}>
          Sign in with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
            <div style={{ flex: 1, borderBottom: '1px solid #ddd' }}></div>
            <span style={{ margin: '0 10px', color: '#888' }}>OR</span>
            <div style={{ flex: 1, borderBottom: '1px solid #ddd' }}></div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

        <p style={{ marginTop: '1rem' }}>
          New here? <Link to="/register" style={{ color: 'var(--minion-blue)', fontWeight: 'bold' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
