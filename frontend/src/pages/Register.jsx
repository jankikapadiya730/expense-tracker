import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/auth/register/', formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Username might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#6366F1]/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0F172A]/5 rounded-full blur-[160px]" />

      <div className="glass-card w-full max-w-xl space-y-12 p-16 bg-white/40 border-slate-200/50 shadow-[0_48px_96px_rgba(15,23,42,0.06)] relative z-10">
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 bg-[#0F172A] rounded-full mx-auto flex items-center justify-center font-black text-xl text-white shadow-xl"
          >
            S
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-[-0.05em] text-[#0F172A] uppercase leading-none">Initialize Identity</h1>
            <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.4em]">Establish your node in the SplitSphere</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full text-center">
              Initialization Failed // Node Conflict Detected
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Primary Sector</label>
              <input name="first_name" type="text" onChange={handleChange} placeholder="FIRST NAME" className="input-field w-full h-14 bg-white/60 rounded-full px-8" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Secondary Sector</label>
              <input name="last_name" type="text" onChange={handleChange} placeholder="LAST NAME" className="input-field w-full h-14 bg-white/60 rounded-full px-8" required />
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between px-6">
                <label className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.2em]">Synchronization ID (UPI)</label>
                <span className="text-[8px] font-black text-slate-300 uppercase italic">Encrypted</span>
             </div>
            <input 
              type="text" 
              name="upi_id" 
              placeholder="id@bank // Optional" 
              className="input-field w-full h-14 bg-white/60 font-mono text-sm rounded-full px-8"
              value={formData.upi_id}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Node Identifier</label>
            <input name="username" type="text" onChange={handleChange} placeholder="USERNAME" className="input-field w-full h-14 bg-white/60 rounded-full px-8" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Communication Port (Email)</label>
            <input name="email" type="email" onChange={handleChange} placeholder="EMAIL" className="input-field w-full h-14 bg-white/60 rounded-full px-8" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Establish Passkey</label>
            <input name="password" type="password" onChange={handleChange} placeholder="••••••••" className="input-field w-full h-14 bg-white/60 rounded-full px-8" required />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary h-14 rounded-full mt-4"
          >
            {loading ? 'CALCULATING...' : 'ESTABLISH NODE'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
          Node Already Registered? <Link to="/login" className="text-[#6366F1] hover:text-[#0F172A] transition-colors">Access Interface</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
