import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { motion, AnimatePresence } from 'framer-motion';

const JoinGroupModal = ({ isOpen, onClose }) => {
  const [inviteCode, setInviteCode] = useState('');
  const { joinGroup } = useGroups();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    joinGroup.mutate(inviteCode, {
      onSuccess: () => {
        onClose();
        setInviteCode('');
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[8px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-card w-full max-w-sm bg-white/90 p-0 overflow-hidden shadow-[0_32px_64px_rgba(15,23,42,0.15)] relative border-slate-200"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight uppercase">Network Access</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#0F172A] transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block text-center">Sync Code Required</label>
                  <input 
                    type="text" 
                    placeholder="ALPHA-SYNC-0" 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="input-field w-full text-center font-bold tracking-[0.4em] text-2xl h-16 uppercase bg-slate-50/50 rounded-full border-slate-200"
                    required
                  />
                  <p className="text-[9px] text-slate-400 mt-6 text-center leading-relaxed font-black uppercase tracking-widest px-4">Secure node established on authorization.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={joinGroup.isPending}
                className="btn-primary w-full"
              >
                {joinGroup.isPending ? 'SYNCHRONIZING...' : 'AUTHORIZE JOIN'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JoinGroupModal;
