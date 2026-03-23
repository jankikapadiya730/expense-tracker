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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-lg bg-[#161B22] p-0 overflow-hidden shadow-2xl relative"
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h2 className="text-xl font-black">Create New Circle</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Group Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Goa Trip 2024" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field w-full text-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="trip">Trip</option>
                      <option value="home">Home</option>
                      <option value="office">Office</option>
                      <option value="friends">Friends</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Invite Friends (Username)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter username..." 
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                      className="input-field flex-1"
                    />
                    <button 
                      type="button" 
                      onClick={addMember}
                      className="btn-secondary px-4 flex items-center justify-center"
                    >
                      <UserPlus size={20} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <AnimatePresence>
                      {initialMembers.map(username => (
                        <motion.span 
                          key={username}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-sm font-bold"
                        >
                          {username}
                          <button onClick={() => removeMember(username)} className="text-gray-500 hover:text-[#F43F5E] transition-colors">
                            <X size={14} />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Description (Optional)</label>
                  <textarea 
                    placeholder="What is this group for?" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field w-full h-24 resize-none leading-relaxed"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={createGroup.isPending}
                  className="w-full btn-primary py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-[#7C3AED]/30 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {createGroup.isPending ? 'Creating...' : 'Create Circle'}
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
