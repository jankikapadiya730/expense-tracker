import React, { useEffect, useState } from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { getNotifications } from '../services/notificationService';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user,
    refetchInterval: 30000 // Poll every 30s
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications?.data?.filter(n => !n.is_read).length || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0D1117]/80 backdrop-blur-xl border-b border-gray-800 shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center font-black text-xl text-white shadow-xl shadow-[#7C3AED]/30"
          >
            S
          </motion.div>
          <span className={`font-black text-2xl tracking-tighter hidden sm:block transition-all ${scrolled ? 'scale-95' : 'scale-100'}`}>SplitSphere</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button className="relative p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-2xl transition-all">
            <Bell size={22} />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-[#F43F5E] text-white text-[10px] font-black flex items-center justify-center rounded-full ring-4 ring-[#0D1117]"
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className="flex items-center gap-4 pl-6 border-l border-gray-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black leading-none">{user.username}</p>
              <p className="text-[10px] text-[#7C3AED] uppercase font-black tracking-widest mt-1.5 opacity-80">{user.preferred_currency || 'INR'}</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-11 h-11 rounded-2xl bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-[#7C3AED] font-black shadow-inner"
            >
              {user.username[0].toUpperCase()}
            </motion.div>
            <button 
              onClick={handleLogout}
              className="p-3 text-gray-500 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-2xl transition-all"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
