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
    <div className="min-h-screen bg-[#0D1117] text-white selection:bg-[#7C3AED]/30">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D1117]/80 backdrop-blur-xl border-t border-gray-800 sm:hidden z-50">
        <div className="flex items-center justify-around h-20 px-2 relative">
           {navItems.map((item, idx) => (
             <Link 
               key={idx} 
               to={item.path} 
               className={`flex flex-col items-center justify-center gap-1 transition-all ${item.primary ? 'p-4 bg-[#7C3AED] rounded-full -translate-y-8 shadow-xl shadow-[#7C3AED]/40' : location.pathname === item.path ? 'text-[#7C3AED]' : 'text-gray-500'}`}
             >
               {item.icon}
               {!item.primary && <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>}
             </Link>
           ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
