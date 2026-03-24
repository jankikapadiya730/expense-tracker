import React from 'react';
import Navbar from './Navbar';
import { Home, Users, Receipt, Bell, Plus, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <Users size={20} />, label: 'Groups', path: '/groups' },
    { icon: <Plus size={24} />, label: 'Add', path: '#', primary: true },
    { icon: <Receipt size={20} />, label: 'Activity', path: '/activity' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen selection:bg-[#7C3AED]/10 transition-colors duration-500">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-3xl border-t border-white/50 sm:hidden z-50">
        <div className="flex items-center justify-around h-24 px-4 relative">
            <Link to="/" className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${location.pathname === '/' ? 'text-[#0F172A]' : 'text-slate-400'}`}>
              <div className={`p-2.5 rounded-full transition-all ${location.pathname === '/' ? 'bg-slate-100' : 'bg-transparent'}`}>
                <Home size={22} className={location.pathname === '/' ? 'fill-[#0F172A]' : ''} />
              </div>
            </Link>
            
            <button className="flex-1 flex justify-center -mt-10">
              <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center text-white shadow-[0_12px_24px_rgba(15,23,42,0.25)] hover:scale-110 active:scale-95 transition-all group">
                <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500" />
              </div>
            </button>

            <Link to="/groups" className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${location.pathname.startsWith('/groups') ? 'text-[#0F172A]' : 'text-slate-400'}`}>
              <div className={`p-2.5 rounded-full transition-all ${location.pathname.startsWith('/groups') ? 'bg-slate-100' : 'bg-transparent'}`}>
                <Users size={22} className={location.pathname.startsWith('/groups') ? 'fill-[#0F172A]' : ''} />
              </div>
            </Link>
        </div>
      </nav>
    </div>

  );
};

export default Layout;
