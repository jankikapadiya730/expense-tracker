import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#6366F1]/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0F172A]/5 rounded-full blur-[160px]" />

      <div className="glass-card w-full max-w-md space-y-12 p-16 bg-white/40 border-slate-200/50 shadow-[0_48px_96px_rgba(15,23,42,0.06)] relative z-10 transition-all">
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 bg-[#0F172A] rounded-full mx-auto flex items-center justify-center font-black text-xl text-white shadow-xl"
          >
            S
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-[-0.05em] text-[#0F172A] uppercase">Enter Sphere.</h1>
            <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.3em]">Operational Financial Intelligence</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full text-center">
              Identity Verification Failed
            </div>
          )}
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Node Identifier</label>
              <input 
                type="text" 
                value={username}
                placeholder="USERNAME"
                onChange={(e) => setUsername(e.target.value)}
                className="input-field w-full h-14 bg-white/60 rounded-full px-8" 
                required 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Access Key</label>
              <input 
                type="password" 
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full h-14 bg-white/60 rounded-full px-8" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary h-14 rounded-full"
          >
            {loading ? 'SYNCING...' : 'AUTHORIZE ACCESS'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
          No Node Assigned? <Link to="/register" className="text-[#6366F1] hover:text-[#0F172A] transition-colors">Apply for Sphere</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
