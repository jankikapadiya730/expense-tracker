import React, { useState } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { useCurrencies } from '../hooks/useCurrencies';
import { motion, AnimatePresence } from 'framer-motion';


const CreateGroupModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('friends');
  const [currency, setCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [initialMembers, setInitialMembers] = useState([]);
  
  const { createGroup } = useGroups();
  const { getSupportedCurrencies } = useCurrencies();
  
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
      currency,
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
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight uppercase">Create New Group</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#0F172A] transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-8">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Group Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Goa Trip 2024" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field w-full h-14 bg-white/60 rounded-full px-8"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-field w-full h-14 bg-white/60 rounded-full px-8 appearance-none cursor-pointer"
                    >
                      <option value="trip">TRIP</option>
                      <option value="home">HOME</option>
                      <option value="office">OFFICE</option>
                      <option value="friends">FRIENDS</option>
                      <option value="other">OTHER</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Universal Currency</label>
                    <div className="relative">
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="input-field w-full h-14 bg-white/60 rounded-full px-8 appearance-none cursor-pointer pr-12 font-bold text-[#0F172A]"
                      >
                        {getSupportedCurrencies.data?.map(curr => (
                          <option key={curr} value={curr}>{curr}</option>
                        ))}
                        {!getSupportedCurrencies.data && <option value="INR">INR</option>}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#6366F1] font-black text-[10px]">
                        CORE
                      </div>
                    </div>
                </div>


                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Description</label>
                  <textarea 
                    placeholder="What is this group for? (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field w-full py-6 bg-white/60 rounded-3xl px-8 min-h-[120px]"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Add Members (Username)</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Enter username" 
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
                  {createGroup.isPending ? 'CREATING GROUP...' : 'CREATE GROUP'}
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
