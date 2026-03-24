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
    <nav className={`fixed top-0 left-0 right-0 h-24 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-[32px] border-b border-slate-200/50 shadow-[0_16px_40px_rgba(15,23,42,0.03)]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
            <motion.div 
               whileHover={{ scale: 1.05 }}
               className="w-10 h-10 bg-[#0F172A] rounded-full flex items-center justify-center text-white shadow-[0_8px_16px_rgba(15,23,42,0.1)] relative"
            >
              <div className="absolute inset-0 bg-white/10 rounded-full animate-ping opacity-20" />
              <span className="font-black text-lg">S</span>
            </motion.div>
            <span className="text-xl font-black tracking-tighter text-slate-900 group-hover:tracking-normal transition-all duration-500 uppercase">
              Split<span className="text-slate-400 group-hover:text-[#6366F1]">Sphere</span>
            </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <button className="relative p-2.5 text-slate-400 hover:text-[#0F172A] transition-colors rounded-full hover:bg-slate-100">
            <Bell size={20} />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#6366F1] border-2 border-white rounded-full"
                >
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

          <div className="flex items-center gap-4 bg-slate-100/50 p-1.5 pr-5 rounded-full border border-slate-200 group/user cursor-pointer hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all">
            <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm group-hover/user:scale-105 transition-transform">
              {user?.username[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{user?.first_name || user?.username}</p>
              <button 
                onClick={handleLogout}
                className="text-[9px] font-black text-[#6366F1] hover:text-[#0F172A] uppercase tracking-[0.2em] transition-colors outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
