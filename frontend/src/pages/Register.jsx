import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md space-y-8 p-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl">S</div>
          <h1 className="text-3xl font-bold tracking-tight">Join SplitSphere</h1>
          <p className="text-gray-400">Start splitting expenses with ease.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">First Name</label>
              <input name="first_name" type="text" onChange={handleChange} className="input-field w-full" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Last Name</label>
              <input name="last_name" type="text" onChange={handleChange} className="input-field w-full" required />
            </div>
          </div>

          {/* UPI ID Input Field */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">UPI ID (Optional)</label>
            <input 
              type="text" 
              name="upi_id" // Added name attribute
              placeholder="username@okaxis" 
              className="input-field w-full"
              value={formData.upi_id}
              onChange={handleChange} // Used general handleChange
            />
            <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase tracking-tight">Used for receiving settlements directly via Razorpay/UPI.</p>
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Username</label>
            <input name="username" type="text" onChange={handleChange} className="input-field w-full" required />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
            <input name="email" type="email" onChange={handleChange} className="input-field w-full" required />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
            <input name="password" type="password" onChange={handleChange} className="input-field w-full" required />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-[#7C3AED] font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
