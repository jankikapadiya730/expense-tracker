import React, { useState, useEffect } from 'react';
import { X, Receipt, Scan, Loader2, Users, CheckCircle2, Circle, Camera } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

const AddExpenseModal = ({ isOpen, onClose, group }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [currency, setCurrency] = useState('INR');
  const [splitType, setSplitType] = useState('equal');
  const [paidBy, setPaidBy] = useState('');
  const [memberValues, setMemberValues] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [dueDate, setDueDate] = useState('');

  
  const { createExpense } = useExpenses(group?.id);

  useEffect(() => {
    if (isOpen && group?.memberships) {
      setSelectedParticipants(group.memberships.map(m => m.user.id));
      setPaidBy(group.memberships[0]?.user.id || '');
    }
  }, [group, isOpen]);

  const toggleAll = () => {
    if (selectedParticipants.length === group.memberships.length) {
      setSelectedParticipants([group.memberships[0].user.id]); // Keep at least one
    } else {
      setSelectedParticipants(group.memberships.map(m => m.user.id));
    }
  };

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      console.log('OCR Output:', text);

      // 1. Better Amount Detection
      // Look for lines containing "total", "amount", "sum", "grand"
      const lines = text.split('\n');
      let foundAmount = null;
      
      const totalKeywords = ['total', 'amount', 'sum', 'grand', 'payable', 'net', 'bill', 'bal', 'due'];
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (totalKeywords.some(kw => lowerLine.includes(kw))) {
          const match = line.match(/(\d{1,6}\.\d{2})|(\d{1,6}\.\d{1,2})/);
          if (match) {
            foundAmount = match[0];
            break;
          }
        }
      }

      if (!foundAmount) {
        // Fallback: Find all money-like numbers and take the highest one that isn't a likely year (4-digit starting with 20 or 19)
        const allNumbers = text.match(/\d+\.\d{2}/g) || [];
        const validPrices = allNumbers
          .map(Number)
          .filter(n => n > 5 && n < 1000000); // Filter out trivial and unrealistic values
          
        if (validPrices.length > 0) {
          foundAmount = Math.max(...validPrices).toFixed(2);
        }
      }

      if (foundAmount) setAmount(foundAmount);

      // 2. Title detection (Top of receipt usually has store name)
      const validLines = lines.filter(l => l.trim().length > 4 && !l.match(/\d/));
      if (validLines.length > 0) {
        setTitle(validLines[0].trim().substring(0, 40));
      }
    } catch (err) {

      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleParticipant = (userId) => {
    if (selectedParticipants.includes(userId)) {
      if (selectedParticipants.length > 1) {
        setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
      }
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!group?.memberships || !amount || parseFloat(amount) <= 0) return;

    let splits = [];
    if (splitType === 'equal') {
      const shareAmount = parseFloat(amount) / selectedParticipants.length;
      splits = selectedParticipants.map(userId => ({
        user_id: userId,
        share_amount: shareAmount.toFixed(2),
      }));
    } else {
      splits = group.memberships.map(m => {
        const val = memberValues[m.user.id] || 0;
        const splitItem = { user_id: m.user.id };
        if (splitType === 'exact') splitItem.share_amount = val;
        else if (splitType === 'percentage') splitItem.percentage = val;
        else if (splitType === 'shares') splitItem.shares = val;
        return splitItem;
      }).filter(s => {
          const val = s.share_amount || s.percentage || s.shares || 0;
          return parseFloat(val) > 0;
      });
    }

    createExpense.mutate({
      group: group.id,
      title,
      amount,
      currency,
      category,
      paid_by_id: paidBy,
      date: new Date().toISOString().split('T')[0],
      due_date: dueDate || null,
      split_type: splitType,
      splits

    }, {

      onSuccess: () => {
        onClose();
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDueDate('');
    setMemberValues({});

    setSplitType('equal');
    if (group?.memberships) {
      setSelectedParticipants(group.memberships.map(m => m.user.id));
    }
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card w-full max-w-3xl bg-[#161B22] p-0 overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] border-gray-800/50"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/20">
                  <Receipt size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Record Expense</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{group?.name || 'Loading Circle...'}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 hover:bg-gray-800/50 rounded-2xl transition-all text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            {!group ? (
               <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
                  <Loader2 className="animate-spin text-[#7C3AED]" size={40} />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching group details...</p>
               </div>
            ) : (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Left Side: Inputs */}
                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.2em] block">Core Details</label>
                      <input 
                         type="text" 
                         placeholder="What was this for?" 
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="input-field w-full text-lg h-14 bg-gray-900/50"
                         required
                       />
                       <div className="flex gap-3">
                          <div className="relative shrink-0">
                             <select 
                               value={currency}
                               onChange={(e) => setCurrency(e.target.value)}
                               className="input-field w-24 h-14 appearance-none text-center pr-4 font-black text-[#7C3AED]"
                             >
                               {['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'AED'].map(c => (
                                  <option key={c} value={c}>{c}</option>
                               ))}
                             </select>
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▾</div>
                          </div>
                          <input 
                            type="number" 
                            placeholder="0.00" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-field flex-1 h-14 text-2xl font-black bg-gray-900/50"
                            required
                          />
                       </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Paid By</label>
                        <div className="relative">
                            <select 
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                            className="input-field w-full h-12 appearance-none pr-10 font-bold"
                            >
                            {group?.memberships?.map(m => (
                                <option key={m.user.id} value={m.user.id}>{m.user.nickname || m.user.username}</option>
                            ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▾</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Due Date (Optional)</label>
                        <input 
                          type="date" 
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="input-field w-full h-12 font-bold"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                        <div className="relative">
                            <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="input-field w-full h-12 appearance-none pr-10 font-bold"
                            >
                                <option value="food">🍔 Food & Drink</option>
                                <option value="transport">🚗 Transport</option>
                                <option value="hotel">🏨 Accommodation</option>
                                <option value="shopping">🛍️ Shopping</option>
                                <option value="entertainment">🎭 Entertainment</option>
                                <option value="other">📦 Other</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▾</div>
                        </div>
                      </div>


                   <label className="btn-secondary h-14 flex items-center gap-3 cursor-pointer justify-center hover:border-[#7C3AED]/50 transition-all border-dashed group w-full">
                      {isScanning ? <Loader2 size={18} className="animate-spin text-[#7C3AED]" /> : <Camera size={18} className="text-gray-400 group-hover:text-[#7C3AED]" />}
                      <span className="text-sm font-bold">Scan Receipt</span>
                      <input type="file" hidden accept="image/*" onChange={handleScan} disabled={isScanning} />
                   </label>
                </div>

                {/* Right Side: Strategy */}
                <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.2em] block">Splitting Strategy</label>
                     <div className="grid grid-cols-2 gap-2">
                       {['equal', 'exact', 'percentage', 'shares'].map((type) => (
                         <button
                           key={type}
                           type="button"
                           onClick={() => setSplitType(type)}
                           className={`p-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                             splitType === type 
                             ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-white shadow-[0_0_15px_rgba(124,58,237,0.2)]' 
                             : 'border-gray-800 bg-gray-900/20 text-gray-500 hover:border-gray-700'
                           }`}
                         >
                           {type}
                         </button>
                       ))}
                     </div>
                  </div>

                  {/* Participant Selection */}
                  <div className="bg-gray-900/30 rounded-2xl p-5 border border-gray-800/80">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={14} className="text-[#7C3AED]" />
                            Splitting with {selectedParticipants.length} people
                        </span>
                        <button 
                            type="button" 
                            onClick={toggleAll}
                            className="text-[10px] font-black text-[#7C3AED] hover:underline uppercase tracking-widest"
                        >
                            {selectedParticipants.length === group?.memberships?.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                        {group?.memberships?.map(m => (
                            <button
                                key={m.user.id}
                                type="button"
                                onClick={() => toggleParticipant(m.user.id)}
                                className={`flex items-center gap-2 p-2.5 rounded-xl transition-all border ${
                                    selectedParticipants.includes(m.user.id)
                                    ? 'bg-[#7C3AED]/10 border-[#7C3AED]/40 text-white'
                                    : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-800/50'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedParticipants.includes(m.user.id) ? 'bg-[#84CC16]' : 'border-2 border-gray-700'}`}>
                                   {selectedParticipants.includes(m.user.id) && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <span className="text-xs font-bold truncate">{m.user.nickname || m.user.username}</span>
                            </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Inputs */}
              {(splitType !== 'equal') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-8 border-t border-gray-800"
                >
                  <label className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.2em] block">Individual Shares</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group?.memberships?.map(m => (
                      <div key={m.user.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedParticipants.includes(m.user.id) ? 'bg-gray-900/50 border-gray-800' : 'opacity-30 pointer-events-none grayscale'}`}>
                        <span className="text-xs font-bold truncate">{m.user.nickname || m.user.username}</span>
                        <div className="flex items-center gap-2">
                           <input 
                              type="number" 
                              placeholder="0" 
                              className="bg-gray-800 border border-gray-700 rounded-lg w-24 h-10 text-right px-3 text-sm font-black focus:border-[#7C3AED] outline-none"
                              value={memberValues[m.user.id] || ''}
                              onChange={(e) => setMemberValues({...memberValues, [m.user.id]: e.target.value})}
                              disabled={!selectedParticipants.includes(m.user.id)}
                            />
                            <span className="text-[10px] text-gray-500 font-black uppercase w-6">
                              {splitType === 'exact' ? currency : splitType === 'percentage' ? '%' : 'sh'}
                            </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            )}

            {/* Footer */}

            <div className="p-8 border-t border-gray-800 bg-gray-900/40 shrink-0">
              <button 
                onClick={handleSubmit}
                disabled={createExpense.isPending || !amount || parseFloat(amount) <= 0 || !title || selectedParticipants.length === 0}
                className="w-full btn-primary h-16 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-[#7C3AED]/30 flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100"

              >
                {createExpense.isPending ? <Loader2 className="animate-spin" /> : <Receipt size={22} />}
                <span>{createExpense.isPending ? 'Syncing...' : 'Confirm Expense'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


export default AddExpenseModal;
