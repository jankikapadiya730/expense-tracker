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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-sm bg-[#161B22] p-0 overflow-hidden shadow-2xl relative"
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h2 className="text-xl font-black">Join a Group</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block text-center">Enter Invite Code</label>
                  <input 
                    type="text" 
                    placeholder="ABCD1234" 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="input-field w-full text-center font-black tracking-widest text-2xl h-16 uppercase"
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-4 text-center leading-relaxed font-medium">Ask your friend for the unique invite code found in their group detail sidebar.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={joinGroup.isPending}
                className="w-full btn-primary py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-[#7C3AED]/30 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {joinGroup.isPending ? 'Joining...' : 'Join Group'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JoinGroupModal;
