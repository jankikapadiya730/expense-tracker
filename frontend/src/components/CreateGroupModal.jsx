import React, { useState } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { motion, AnimatePresence } from 'framer-motion';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('friends');
  const [description, setDescription] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [initialMembers, setInitialMembers] = useState([]);
  
  const { createGroup } = useGroups();
  
  const addMember = () => {
    if (memberInput.trim() && !initialMembers.includes(memberInput.trim())) {
      setInitialMembers([...initialMembers, memberInput.trim()]);
      setMemberInput('');
    }
  };

  const removeMember = (username) => {
    setInitialMembers(initialMembers.filter(m => m !== username));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createGroup.mutate({ 
      name, 
      category, 
      description,
      initial_members: initialMembers 
    }, {
      onSuccess: () => {
        onClose();
        setName('');
        setDescription('');
        setInitialMembers([]);
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
            className="glass-card w-full max-w-xl bg-white/90 p-0 overflow-hidden shadow-[0_32px_64px_rgba(15,23,42,0.15)] relative border-slate-200"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight uppercase">Orchestrate New Sector</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#0F172A] transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-8">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Sector Designation</label>
                    <input 
                      type="text" 
                      placeholder="e.g., GLOBAL_PROJECT_24" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field w-full h-14 bg-white/60 rounded-full px-8"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Infrastructure Type</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-field w-full h-14 bg-white/60 rounded-full px-8 appearance-none cursor-pointer"
                    >
                      <option value="trip">EXPEDITION</option>
                      <option value="home">CORE_DOMICILE</option>
                      <option value="office">HEADQUARTERS</option>
                      <option value="friends">NETWORK_SOCIAL</option>
                      <option value="other">STAGED_UTILITY</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Network Description</label>
                  <textarea 
                    placeholder="Define the scope of this sector..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field w-full py-6 bg-white/60 rounded-3xl px-8 min-h-[120px]"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Initialize Nodes (Username)</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="SCAN_IDENTIFIER" 
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                      className="input-field flex-1 h-14 bg-white/60 rounded-full px-8"
                    />
                    <button 
                      type="button" 
                      onClick={addMember}
                      className="w-14 h-14 rounded-full bg-[#0F172A] text-white flex items-center justify-center hover:bg-[#6366F1] transition-all shadow-lg"
                    >
                      <UserPlus size={20} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <AnimatePresence>
                      {initialMembers.map(member => (
                        <motion.span 
                          key={member}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="pl-4 pr-1 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black text-[#0F172A] flex items-center gap-2 uppercase tracking-widest"
                        >
                          {member}
                          <button 
                            type="button"
                            onClick={() => removeMember(member)}
                            className="w-6 h-6 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all flex items-center justify-center"
                          >
                            <Trash2 size={12} />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={createGroup.isPending}
                  className="btn-primary w-full mt-6"
                >
                  {createGroup.isPending ? 'INITIALIZING SECTOR...' : 'ESTABLISH SECTOR'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
