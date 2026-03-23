import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data: tokens } = await axios.post('http://localhost:8000/api/auth/login/', {
        username,
        password
      });
      
      const { data: user } = await axios.get('http://localhost:8000/api/auth/me/', {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      
      setAuth(user, tokens.access, tokens.refresh);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md space-y-8 p-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl">S</div>
          <h1 className="text-3xl font-bold tracking-tight">SplitSphere</h1>
          <p className="text-gray-400">Welcome back! Please login to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field w-full" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Don't have an account? <Link to="/register" className="text-[#7C3AED] font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
