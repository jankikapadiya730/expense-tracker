import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import Layout from '../components/Layout';
import { useGroups } from '../hooks/useGroups';
import { ArrowLeft, Copy, Check, Receipt, User, Wallet, FileText, Table, Bell, Loader2, BarChart3, TrendingUp, Clock } from 'lucide-react';

import AddExpenseModal from '../components/AddExpenseModal';
import { useAuthStore } from '../store/authStore';
import { sendReminder, getNotifications } from '../services/notificationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Analytics from '../components/Analytics';
import { motion, AnimatePresence } from 'framer-motion';

const GroupDetail = () => {
  const { id } = useParams();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = React.useState(false);
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [codeCopied, setCodeCopied] = React.useState(false);
  const { user, token } = useAuthStore();


  const { getExpenses, getBalances } = useExpenses(id);
  const { getGroupDetail } = useGroups();
  const queryClient = useQueryClient();
  
  const { data: group, isLoading: isGroupLoading } = getGroupDetail(id);

  
  const remindMutation = useMutation({
    mutationFn: ({ groupId, userId }) => sendReminder(groupId, userId),
    onSuccess: () => alert('Reminder sent!')
  });

  const settleMutation = useMutation({
    mutationFn: (data) => axios.post('http://localhost:8000/api/settlements/', data, {
        headers: { Authorization: `Bearer ${token}` }

    }),
    onSuccess: () => {
        queryClient.invalidateQueries(['balances', id]);
        alert('Settlement recorded!');
    }
  });

  const initiateRazorpayPayment = async (receiverId, amount) => {
    try {
      // 1. Create Order on Backend
      const { data: orderData } = await axios.post('http://localhost:8000/api/settlements/create-order/', {
        amount: Math.abs(amount),
        currency: 'INR',
        paid_to_id: receiverId,
        group_id: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });


      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SplitSphere Settlement",
        description: `Settling debt in ${group?.name}`,
        order_id: orderData.order_id,
        handler: async (response) => {
          // 3. Verify Payment on Backend
          try {
            await axios.post('http://localhost:8000/api/settlements/verify-payment/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              group_id: id,
              paid_to_id: receiverId,
              amount: Math.abs(amount)
            }, {
                headers: { Authorization: `Bearer ${token}` }

            });
            
            queryClient.invalidateQueries(['balances', id]);
            alert('Settlement successful and recorded! 🚀');
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
        },
        theme: {
          color: "#7C3AED",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Failed to initiate payment. Ensure you have entered amount and recipient.');
    }
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Layout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        <motion.div variants={itemVariants}>
          <Link to="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-[#0F172A] mb-8 group transition-all">
            <ArrowLeft size={16} className="group-hover:-translate-x-1.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Core</span>
          </Link>
        </motion.div>

        {/* HUD Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-200 pb-12">
          <motion.div variants={itemVariants} className="flex items-center gap-10">
            <div className="w-24 h-24 bg-[#0F172A] rounded-full flex items-center justify-center text-4xl font-black text-white shadow-[0_24px_48px_rgba(15,23,42,0.15)] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
               {group?.name ? group.name[0] : 'G'}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                 <h1 className="text-6xl font-bold tracking-[-0.05em] text-[#0F172A] leading-none uppercase">{group?.name}</h1>
                 <span className="px-4 py-1.5 rounded-full bg-slate-100 text-[9px] uppercase font-black tracking-[0.2em] text-[#6366F1] border border-slate-200">{group?.category} / SECTOR</span>
              </div>
              <p className="text-slate-500 text-xl font-medium max-w-xl">{group?.description || "High-performance synchronization for your shared ecosystem."}</p>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
             <div className="flex gap-2 bg-white/50 p-2 rounded-full border border-slate-200">
                <button 
                  onClick={() => window.open(`http://localhost:8000/api/reports/group/${id}/pdf/`, '_blank')}
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#0F172A] transition-all"
                  title="Export PDF"
                >
                  <FileText size={20} />
                </button>
                <button 
                  onClick={() => window.open(`http://localhost:8000/api/reports/group/${id}/excel/`, '_blank')}
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#0F172A] transition-all"
                  title="Export Excel"
                >
                  <Table size={20} />
                </button>
             </div>
             <button 
               onClick={() => setShowAnalytics(!showAnalytics)}
               className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border ${showAnalytics ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-[#0F172A]/20' : 'bg-white/50 border-slate-200 text-slate-400 hover:text-[#0F172A]'}`}
               title="Visual Analytics"
             >
               <BarChart3 size={20} />
             </button>
             <button 
               onClick={() => setIsAddExpenseOpen(true)}
               className="btn-primary"
             >
               + INITIALZE ENTRY
             </button>
          </motion.div>
        </div>

        <AddExpenseModal 
          isOpen={isAddExpenseOpen} 
          onClose={() => setIsAddExpenseOpen(false)} 
          group={group} 
        />

        <AnimatePresence>
          {showAnalytics && (
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="overflow-hidden"
             >
               <div className="glass-card mb-12 bg-white/40">
                  <div className="flex items-center gap-3 mb-8 p-10 pb-0">
                     <div className="w-2 h-2 rounded-full bg-[#6366F1]" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Cognitive Intelligence</span>
                  </div>
                  <Analytics expenses={getExpenses.data} />
               </div>
             </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pt-4">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-20">
            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] uppercase flex items-center gap-4">
                  <Receipt className="text-[#6366F1]" size={24} />
                  Operational Log
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{getExpenses.data?.length || 0} Records</span>
              </div>
              
              {getExpenses.isLoading ? (
                 <div className="space-y-6">
                   {[1, 2, 3].map(i => <div key={i} className="glass-card h-32 animate-pulse"></div>)}
                 </div>
              ) : getExpenses.data?.length === 0 ? (
                 <motion.div variants={itemVariants} className="glass-card text-center py-24 border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-slate-400 font-bold text-lg tracking-tight">No data detected in current node.</p>
                 </motion.div>
              ) : (
                 <div className="space-y-6">
                   {getExpenses.data?.map((expense, idx) => (
                      <motion.div 
                        key={expense.id} 
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className="glass-card flex items-center justify-between hover:bg-white transition-all group py-8 px-10"
                      >
                         <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0F172A] group-hover:text-white transition-all duration-500 border border-slate-100">
                               <Receipt size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-2xl text-[#0F172A] group-hover:tracking-tight transition-all">{expense.title}</h4>
                               <div className="flex items-center gap-3 mt-2">
                                  <span className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest">{expense.paid_by.username}</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                               </div>
                               {expense.due_date && (
                                  <div className={`text-[9px] font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2 ${
                                    new Date(expense.due_date) < new Date() ? 'text-[#EC4899]' : 'text-slate-400'
                                  }`}>
                                    <Clock size={11} />
                                    DEADLINE: {new Date(expense.due_date).toLocaleDateString()}
                                    {new Date(expense.due_date) < new Date() && <span className="bg-[#EC4899]/10 px-2 py-0.5 rounded-full text-[#EC4899]">System Overdue</span>}
                                  </div>
                                )}
                            </div>
                         </div>
                         <div className="flex items-center gap-10 text-right">
                            {expense.paid_by.id === user?.id && expense.due_date && new Date(expense.due_date) < new Date() && (
                               <button 
                                 onClick={async (e) => {
                                   e.stopPropagation();
                                   try {
                                     await axios.post(`http://localhost:8000/api/expenses/${expense.id}/nudge/`, {}, {
                                       headers: { Authorization: `Bearer ${token}` }
                                     });
                                   } catch (err) {
                                     alert('Failed to send nudge.');
                                   }
                                 }}
                                 className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-[#6366F1] hover:text-white hover:scale-110 transition-all border border-slate-100 group/nudge"
                                 title="Nudge Debtors"
                               >
                                 <Bell size={16} className="group-hover/nudge:animate-shake" />
                               </button>
                            )}
                            <div>
                               <div className="font-bold text-3xl tracking-tighter text-[#0F172A]">₹{parseFloat(expense.amount).toLocaleString()}</div>
                               <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">{expense.category}</div>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                 </div>
              )}
            </div>

            {/* Payment Log */}
            <div className="space-y-10">
               <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <Wallet className="text-[#84CC16]" size={24} />
                  <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] uppercase">Synchronization History</h2>
               </div>
               <div className="space-y-4">
                  {group?.settlements?.length === 0 || !group?.settlements ? (
                     <p className="text-slate-400 text-sm font-bold tracking-widest py-20 glass-card bg-slate-50/30 border-dashed text-center">NO DATA DETECTED</p>
                  ) : (
                     group.settlements.slice().reverse().map(s => {
                        const isPayee = s.paid_to === user?.username;
                        const isPayer = s.paid_by === user?.username;
                        
                        return (
                          <motion.div 
                            key={s.id} 
                            variants={itemVariants}
                            className="glass-card flex items-center justify-between border-slate-100 py-6 px-10 hover:bg-white transition-all"
                          >
                            <div className="flex items-center gap-6">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                                  isPayer ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-[#84CC16]'
                               }`}>
                                  <TrendingUp size={20} className={isPayer ? 'rotate-180' : ''} />
                               </div>
                               <div>
                                  <h4 className="font-bold text-lg text-[#0F172A] leading-tight">
                                     {isPayer ? 'YOU ' : `${s.paid_by} `}
                                     <span className="text-slate-400 font-light mx-1">/</span>
                                     <span className="text-[#6366F1]">{isPayee ? 'YOU' : s.paid_to}</span>
                                  </h4>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">
                                     TRX_ID {s.id.slice(0,8)} // {new Date(s.settled_at).toLocaleDateString()}
                                  </p>
                               </div>
                            </div>
                            <div className={`font-bold text-2xl tracking-tighter ${isPayer ? 'text-[#0F172A]' : 'text-[#84CC16]'}`}>
                               {isPayer ? '-' : '+'}₹{parseFloat(s.amount).toFixed(2)}
                            </div>
                          </motion.div>
                        );
                     })
                   )}
                </div>
             </div>
          </div>


          {/* Cyber Sidebar */}
          <div className="space-y-12">
            <motion.div variants={itemVariants} className="glass-card p-0 overflow-hidden bg-white shadow-[0_40px_80px_rgba(15,23,42,0.06)] border-slate-100">
               <div className="bg-[#0F172A] p-10 text-white">
                  <div className="flex items-center gap-4 mb-2">
                     <Wallet size={20} className="text-[#6366F1]" />
                     <h3 className="font-bold text-sm uppercase tracking-[0.2em]">Cognitive Balances</h3>
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">Network Node Status</p>
               </div>
               
               <div className="p-4 space-y-1">
                  {getBalances.data?.map(balance => {
                    const isMe = balance.user.id === user?.id;
                    const myBalance = getBalances.data?.find(b => b.user.id === user?.id)?.net_balance || 0;
                    
                    return (
                      <div 
                        key={balance.user.id} 
                        className={`flex items-center justify-between p-6 rounded-[1.5rem] transition-all ${
                          isMe ? 'bg-slate-50 border border-slate-100' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                              isMe ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-400'
                           }`}>
                              {balance.user.username[0].toUpperCase()}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isMe ? 'text-[#0F172A]' : 'text-slate-600'}`}>
                                  {isMe ? 'YOU' : balance.user.username}
                                </span>
                                {isMe && <span className="text-[10px] font-black text-[#6366F1] tracking-widest ">// MOD</span>}
                              </div>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mt-1">
                                {balance.net_balance > 0 ? 'Surplus' : balance.net_balance < 0 ? 'Deficit' : 'Synced'}
                              </p>
                           </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                           <div className={`text-lg font-bold tracking-tighter ${balance.net_balance >= 0 ? 'text-[#0F172A]' : 'text-[#EC4899]'}`}>
                              ₹{Math.abs(balance.net_balance).toFixed(2)}
                           </div>
                           
                           <div className="flex gap-2">
                              {isMe && balance.net_balance < 0 && (
                                <button 
                                  onClick={() => {
                                    const creditor = getBalances.data.find(b => b.net_balance > 0);
                                    if (creditor) initiateRazorpayPayment(creditor.user.id, Math.abs(balance.net_balance));
                                    else alert("SYTEM_SYNCED");
                                  }}
                                  className="px-4 py-2 bg-[#0F172A] text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#6366F1] transition-all"
                                >
                                  SETTLE
                                </button>
                              )}
                              {myBalance > 0 && balance.net_balance < 0 && !isMe && (
                                <button 
                                  onClick={() => remindMutation.mutate({ groupId: id, userId: balance.user.id })}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-[#6366F1] transition-all border border-slate-200"
                                >
                                  <Bell size={14} />
                                </button>
                              )}
                           </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card bg-[#F8FAFC] border-slate-200 shadow-sm p-10">
               <span className="text-[9px] font-black text-[#6366F1] uppercase tracking-[0.4em] mb-4 block">Network Access</span>
               <h3 className="font-bold text-2xl text-[#0F172A] mb-6 tracking-tight">Invite Code</h3>
               <div
                 className={`bg-white border-2 p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                   codeCopied ? 'border-[#84CC16] bg-[#f0fdf4]' : 'border-slate-100 hover:border-[#6366F1]'
                 }`}
                 onClick={() => {
                   if (!group?.invite_code) return;
                   navigator.clipboard.writeText(group.invite_code);
                   setCodeCopied(true);
                   setTimeout(() => setCodeCopied(false), 2000);
                 }}
               >
                 <span className="font-mono font-bold text-xl tracking-[0.3em] text-[#0F172A] pl-2 select-all">
                   {group?.invite_code || '------'}
                 </span>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                   codeCopied ? 'bg-[#84CC16] text-white' : 'bg-slate-900 text-white hover:bg-[#6366F1]'
                 }`}>
                   {codeCopied ? <Check size={16} /> : <Copy size={16} />}
                 </div>
               </div>
               <p className={`text-[9px] font-black uppercase tracking-widest mt-4 px-2 transition-colors ${
                 codeCopied ? 'text-[#84CC16]' : 'text-slate-400'
               }`}>
                 {codeCopied ? 'Code copied to clipboard' : 'Click to copy · peer-to-peer encrypted'}
               </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default GroupDetail;
