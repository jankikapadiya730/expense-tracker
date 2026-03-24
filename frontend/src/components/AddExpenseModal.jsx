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
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[8px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-card w-full max-w-4xl bg-white/90 p-0 overflow-hidden shadow-[0_48px_96px_rgba(15,23,42,0.18)] relative flex flex-col max-h-[92vh] border-slate-200"
          >
            {/* HUD Header */}
            <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center text-white shadow-lg relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/10" />
                   <Receipt size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] uppercase">Initialize Entry</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 block">SEC_NODE // {group?.name || 'SYNCING'}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#0F172A] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Core */}
            {!group ? (
               <div className="flex-1 flex flex-col items-center justify-center p-24 space-y-8">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-[#6366F1] rounded-full animate-spin" />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Querying Metadata...</p>
               </div>
            ) : (
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                {/* Left: Input Matrix */}
                <div className="space-y-12">
                   <div className="space-y-6">
                      <label className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.4em] block ml-6">Entry Identifier</label>
                      <input 
                         type="text" 
                         placeholder="GLOBAL_EXPENSE_TAG" 
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="input-field w-full text-2xl h-16 rounded-full px-10 bg-slate-50/50 border-slate-200"
                         required
                       />
                       <div className="flex gap-4">
                          <div className="relative shrink-0">
                             <select 
                               value={currency}
                               onChange={(e) => setCurrency(e.target.value)}
                               className="input-field w-32 h-16 appearance-none text-center font-black text-[#0F172A] bg-slate-50/50 rounded-full border-slate-200"
                             >
                               {['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'AED'].map(c => (
                                  <option key={c} value={c}>{c}</option>
                               ))}
                             </select>
                          </div>
                          <input 
                            type="number" 
                            placeholder="0.00" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-field flex-1 h-16 text-3xl font-bold tracking-tighter bg-slate-50/50 rounded-full px-10 border-slate-200"
                            required
                          />
                       </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Source Node</label>
                        <select 
                          value={paidBy}
                          onChange={(e) => setPaidBy(e.target.value)}
                          className="input-field w-full h-14 bg-white/60 rounded-full px-8 appearance-none cursor-pointer border-slate-200"
                        >
                          {group?.memberships?.map(m => (
                              <option key={m.user.id} value={m.user.id}>{m.user.username}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Deadline (Sync)</label>
                        <input 
                          type="date" 
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="input-field w-full h-14 bg-white/60 rounded-full px-8 border-slate-200"
                        />
                      </div>
                   </div>

                   <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Category Sector</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="input-field w-full h-14 bg-white/60 rounded-full px-8 appearance-none cursor-pointer border-slate-200"
                        >
                            <option value="food">FOOD_RESOURCES</option>
                            <option value="transport">LOGISTICS_BASE</option>
                            <option value="hotel">DWELLING_UNIT</option>
                            <option value="shopping">ASSET_ACQUISITION</option>
                            <option value="entertainment">COGNITIVE_RECREATION</option>
                            <option value="other">UNCATEGORIZED_FLOW</option>
                        </select>
                    </div>

                    <label className="h-16 flex items-center gap-4 cursor-pointer justify-center hover:bg-slate-50 transition-all border-2 border-dashed border-slate-100 rounded-full group w-full bg-white/40">
                       {isScanning ? <Loader2 size={20} className="animate-spin text-[#6366F1]" /> : <Camera size={20} className="text-slate-300 group-hover:text-[#6366F1] transition-colors" />}
                       <span className="text-[10px] font-black text-slate-400 group-hover:text-[#0F172A] transition-colors uppercase tracking-[0.3em]">Digitalize Neural Receipt</span>
                       <input type="file" hidden accept="image/*" onChange={handleScan} disabled={isScanning} />
                    </label>
                </div>

                {/* Right: Strategy Cluster */}
                <div className="space-y-12">
                  <div className="space-y-6">
                     <label className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.4em] block ml-6">Splitting Protocol</label>
                     <div className="grid grid-cols-2 gap-4">
                       {['equal', 'exact', 'percentage', 'shares'].map((type) => (
                         <button
                           key={type}
                           type="button"
                           onClick={() => setSplitType(type)}
                           className={`h-14 rounded-full border font-black uppercase text-[9px] tracking-[0.3em] transition-all ${
                             splitType === type 
                             ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-[#0F172A]/20' 
                             : 'border-slate-100 bg-white/50 text-slate-400 hover:border-slate-200'
                           }`}
                         >
                           {type}
                         </button>
                       ))}
                     </div>
                  </div>

                  {/* Node Network */}
                  <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                            <Users size={14} className="text-[#6366F1]" />
                            {selectedParticipants.length} NODES_SYNCED
                        </span>
                        <button 
                            type="button" 
                            onClick={toggleAll}
                            className="text-[9px] font-black text-[#6366F1] hover:text-[#0F172A] uppercase tracking-[0.3em] transition-all"
                        >
                            {selectedParticipants.length === group?.memberships?.length ? 'SYSTEM_RESET' : 'SYNC_ALL'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {group?.memberships?.map(m => (
                            <button
                                key={m.user.id}
                                type="button"
                                onClick={() => toggleParticipant(m.user.id)}
                                className={`flex items-center gap-4 p-4 rounded-full transition-all border ${
                                    selectedParticipants.includes(m.user.id)
                                    ? 'bg-white border-slate-200 text-[#0F172A] shadow-sm'
                                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/40'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedParticipants.includes(m.user.id) ? 'bg-[#0F172A] text-white' : 'border border-slate-200'}`}>
                                   {selectedParticipants.includes(m.user.id) && <CheckCircle2 size={12} />}
                                </div>
                                <span className="text-[11px] font-bold truncate uppercase tracking-tight">{m.user.username}</span>
                            </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Allocation Panel */}
              {(splitType !== 'equal') && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 pt-16 border-t border-slate-100"
                >
                  <label className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.4em] block ml-6">Node-Specific Allocation</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group?.memberships?.map(m => (
                      <div key={m.user.id} className={`flex items-center justify-between p-6 rounded-[1.75rem] border transition-all ${selectedParticipants.includes(m.user.id) ? 'bg-white border-slate-200 shadow-sm' : 'opacity-10 pointer-events-none'}`}>
                        <span className="text-[11px] font-bold text-slate-500 truncate uppercase mt-1 px-2">{m.user.username}</span>
                        <div className="flex items-center gap-4">
                           <input 
                              type="number" 
                              placeholder="0" 
                              className="bg-slate-50 border border-slate-100 rounded-full w-24 h-12 text-center px-4 text-sm font-black focus:border-[#6366F1] focus:bg-white outline-none transition-all"
                              value={memberValues[m.user.id] || ''}
                              onChange={(e) => setMemberValues({...memberValues, [m.user.id]: e.target.value})}
                              disabled={!selectedParticipants.includes(m.user.id)}
                            />
                            <span className="text-[9px] text-slate-300 font-black uppercase w-6">
                              {splitType === 'exact' ? currency : splitType === 'percentage' ? '%' : 'SH'}
                            </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            )}

            {/* HUD Footer */}
            <div className="p-10 border-t border-slate-100 bg-slate-50/30 shrink-0">
              <button 
                onClick={handleSubmit}
                disabled={createExpense.isPending || !amount || parseFloat(amount) <= 0 || !title || selectedParticipants.length === 0}
                className="btn-primary w-full h-16 rounded-full"
              >
                {createExpense.isPending ? 'SYNCHRONIZING_DATA...' : 'INITIALIZE SYNC'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseModal;
