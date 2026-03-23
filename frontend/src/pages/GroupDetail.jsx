import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import Layout from '../components/Layout';
import { useGroups } from '../hooks/useGroups';
import { ArrowLeft, Plus, Receipt, User, Wallet, FileText, Table, Bell, Loader2, BarChart3, TrendingUp, Clock } from 'lucide-react';

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
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 group transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
          </Link>
        </motion.div>

        {/* Group Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div variants={itemVariants} className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-800 border-2 border-[#7C3AED]/30 rounded-3xl flex items-center justify-center text-3xl font-black text-[#7C3AED] shadow-2xl shadow-[#7C3AED]/10">
              {group?.name ? group.name[0] : 'G'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black tracking-tight">{group?.name}</h1>
                 <span className="px-3 py-1 rounded-full bg-gray-800 text-[10px] uppercase font-black tracking-widest text-[#7C3AED] border border-gray-700">{group?.category}</span>
              </div>
              <p className="text-gray-500 mt-2 text-lg font-medium">{group?.description || "Shared financial hub for your circle."}</p>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
             <button 
               onClick={() => window.open(`http://localhost:8000/api/reports/group/${id}/pdf/`, '_blank')}
               className="btn-secondary p-4 rounded-xl"
               title="Export PDF"
             >
               <FileText size={20} />
             </button>
             <button 
               onClick={() => window.open(`http://localhost:8000/api/reports/group/${id}/excel/`, '_blank')}
               className="btn-secondary p-4 rounded-xl"
               title="Export Excel"
             >
               <Table size={20} />
             </button>
             <button 
               onClick={() => setShowAnalytics(!showAnalytics)}
               className={`btn-secondary p-4 rounded-xl transition-all ${showAnalytics ? 'bg-[#7C3AED] text-white' : 'hover:border-[#7C3AED]/50'}`}
               title="Visual Analytics"
             >
               <TrendingUp size={20} />
             </button>
             <button 
               onClick={() => setIsAddExpenseOpen(true)}
               className="btn-primary flex items-center gap-3 px-6 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-[#7C3AED]/30 hover:scale-105 active:scale-95 transition-all"
             >
               <Plus size={20} />
               Add Expense
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
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="overflow-hidden"
             >
               <Analytics expenses={getExpenses.data} />
             </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Receipt className="text-[#7C3AED]" />
                Expense Feed
              </h2>
              
              {getExpenses.isLoading ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map(i => <div key={i} className="glass-card h-24 animate-pulse bg-gray-800/50"></div>)}
                 </div>
              ) : getExpenses.data?.length === 0 ? (
                 <motion.div variants={itemVariants} className="glass-card text-center py-20 border-dashed border-2 border-gray-800">
                    <p className="text-gray-500 font-medium">No expenses recorded yet. Start sharing the bills!</p>
                 </motion.div>
              ) : (
                 <div className="space-y-4">
                   {getExpenses.data?.map((expense, idx) => (
                      <motion.div 
                        key={expense.id} 
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                        className="glass-card flex items-center justify-between hover:bg-[#1C2128] transition-all group"
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:bg-[#7C3AED] group-hover:text-white transition-all shadow-inner">
                               <Receipt size={22} />
                            </div>
                            <div>
                               <h4 className="font-bold text-lg group-hover:text-[#7C3AED] transition-colors">{expense.title}</h4>
                               <p className="text-sm text-gray-500 font-medium">
                                  Paid by <span className="text-gray-300">{expense.paid_by.username}</span> • {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                               </p>
                               {expense.due_date && (
                                  <div className={`text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1.5 ${
                                    new Date(expense.due_date) < new Date() ? 'text-red-400' : 'text-gray-500'
                                  }`}>
                                    <Clock size={10} />
                                    Due {new Date(expense.due_date).toLocaleDateString()}
                                    {new Date(expense.due_date) < new Date() && <span className="bg-red-500/20 px-1.5 py-0.5 rounded text-red-500">Overdue</span>}
                                  </div>
                                )}
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            {expense.paid_by.id === user?.id && expense.due_date && new Date(expense.due_date) < new Date() && (
                               <button 
                                 onClick={async (e) => {
                                   e.stopPropagation();
                                   try {
                                     await axios.post(`http://localhost:8000/api/expenses/${expense.id}/nudge/`, {}, {
                                       headers: { Authorization: `Bearer ${token}` }
                                     });
                                     alert('Nudge sent to everyone who hasn\'t paid!');
                                   } catch (err) {
                                     alert('Failed to send nudge.');
                                   }
                                 }}
                                 className="p-2 hover:bg-red-500/10 rounded-xl text-red-400 border border-red-500/20 transition-all flex items-center gap-2"
                                 title="Nudge Debtors"
                               >
                                 <Bell size={14} className="animate-bounce" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Nudge</span>
                               </button>
                            )}
                            <div className="text-right">
                               <div className="font-black text-2xl tracking-tight">₹{parseFloat(expense.amount).toLocaleString()}</div>
                               <div className="text-[10px] text-[#7C3AED] font-black uppercase tracking-widest mt-1 opacity-70">{expense.category}</div>
                            </div>
                         </div>

                      </motion.div>
                   ))}
                 </div>
              )}
            </div>

            {/* Settlement History */}
            <div className="space-y-6">
               <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                 <Wallet className="text-[#84CC16]" />
                 Payment History
               </h2>
               <div className="space-y-4">
                  {group?.settlements?.length === 0 || !group?.settlements ? (
                     <p className="text-gray-500 text-sm font-medium italic p-10 glass-card bg-transparent border-dashed border-gray-800 text-center">No payments recorded in this circle yet.</p>
                  ) : (
                     group.settlements.slice().reverse().map(s => {
                        const isPayee = s.paid_to === user?.username;
                        const isPayer = s.paid_by === user?.username;
                        
                        return (
                          <motion.div 
                            key={s.id} 
                            variants={itemVariants}
                            className={`glass-card flex items-center justify-between transition-all border ${
                              isPayer ? 'border-red-500/10 bg-red-500/5' : isPayee ? 'border-green-500/10 bg-green-500/5' : 'bg-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  isPayer ? 'bg-red-500/20 text-red-500' : isPayee ? 'bg-green-500/20 text-green-500' : 'bg-gray-800 text-gray-400'
                               }`}>
                                  {isPayer ? <TrendingUp size={18} className="rotate-180" /> : <TrendingUp size={18} />}
                               </div>
                               <div>
                                  <h4 className="font-bold text-sm">
                                     {isPayer ? 'You paid ' : `${s.paid_by} paid `}
                                     <span className="text-[#84CC16]">{isPayee ? 'You' : s.paid_to}</span>
                                  </h4>
                                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                                     {new Date(s.settled_at).toLocaleDateString()} • {s.is_confirmed ? '✅ Verified' : '⏳ Pending'}
                                  </p>
                               </div>
                            </div>
                            <div className={`font-black text-xl ${isPayer ? 'text-red-400' : isPayee ? 'text-green-400' : 'text-white'}`}>
                               {isPayer ? '-' : isPayee ? '+' : ''}₹{parseFloat(s.amount).toFixed(2)}
                            </div>
                          </motion.div>
                        );
                     })
                  )}
               </div>
            </div>
          </div>


          {/* Sidebar */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="glass-card space-y-6 border-[#84CC16]/20 bg-[#84CC16]/5">
               <h3 className="font-black text-lg flex items-center gap-3 text-[#84CC16] uppercase tracking-widest">
                 <Wallet size={20} />
                 Balances
               </h3>
               
               <div className="space-y-4">
                  {getBalances.data?.map(balance => {
                    const isMe = balance.user.id === user?.id;
                    const myBalance = getBalances.data?.find(b => b.user.id === user?.id)?.net_balance || 0;
                    
                    return (
                      <div 
                        key={balance.user.id} 
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                          isMe ? 'bg-[#7C3AED]/10 border-[#7C3AED]/30 shadow-lg shadow-[#7C3AED]/5' : 'hover:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-colors ${
                              isMe ? 'bg-[#7C3AED] text-white' : 'bg-gray-800 border border-gray-700'
                           }`}>
                              {balance.user.username[0].toUpperCase()}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-black ${isMe ? 'text-white' : 'text-gray-300'}`}>
                                  {isMe ? 'You' : (balance.user.nickname || balance.user.username)}
                                </span>
                                {isMe && <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-md">Me</span>}
                              </div>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                {balance.net_balance > 0 ? (isMe ? 'You are owed' : 'Is owed') : (balance.net_balance < 0 ? (isMe ? 'You owe' : 'Owes') : 'Settled')}
                              </p>

                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <div className={`text-lg font-black tracking-tight ${balance.net_balance >= 0 ? 'text-[#84CC16]' : 'text-[#F43F5E]'}`}>
                              {balance.net_balance > 0 ? '+' : ''}₹{Math.abs(balance.net_balance).toFixed(2)}
                           </div>
                           
                           {/* Action Buttons */}
                           <div className="flex gap-2">
                              {/* If this is ME and I owe money, show Pay button on MY row */}
                              {isMe && balance.net_balance < 0 && (
                                <button 
                                  onClick={() => {
                                    const creditor = getBalances.data.find(b => b.net_balance > 0);
                                    if (creditor) {
                                      initiateRazorpayPayment(creditor.user.id, Math.abs(balance.net_balance));
                                    } else {
                                      alert("No one to pay! Everyone's settled.");
                                    }
                                  }}
                                  className="px-4 py-2 bg-[#84CC16] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#84CC16]/20"
                                >
                                  Settle Now
                                </button>
                              )}
                              
                              {/* If I am a creditor and they are a debtor, show Remind button next to THEM */}
                              {myBalance > 0 && balance.net_balance < 0 && !isMe && (
                                <button 
                                  onClick={() => remindMutation.mutate({ groupId: id, userId: balance.user.id })}
                                  disabled={remindMutation.isPending}
                                  className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-[#7C3AED] transition-all disabled:opacity-50" 
                                  title="Send Reminder"
                                >
                                  {remindMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                                </button>
                              )}
                           </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card bg-[#7C3AED]/10 border-[#7C3AED]/20">
               <h3 className="font-black text-sm mb-2 text-[#7C3AED] uppercase tracking-widest">Circle Invite</h3>
               <p className="text-xs text-gray-400 mb-5 font-medium leading-relaxed">Let your friends join this circle using the code below.</p>
               <div className="bg-[#0D1117]/80 border-2 border-dashed border-[#7C3AED]/30 p-5 rounded-2xl flex items-center justify-between group/code transition-all hover:border-[#7C3AED]">
                  <span className="font-mono font-black text-xl tracking-[0.2em] text-[#7C3AED]">{group?.invite_code || "..."}</span>
                  <button 
                    className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                    onClick={() => {
                        navigator.clipboard.writeText(group?.invite_code);
                        alert('Code copied!');
                    }}
                  >
                    Copy
                  </button>
               </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default GroupDetail;
