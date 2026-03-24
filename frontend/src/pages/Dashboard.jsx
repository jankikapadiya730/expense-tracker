import React from 'react';
import { Users } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const { getGroups } = useGroups();

  const mockSummary = {
    oweToMe: 1240.50,
    iOwe: 850.25,
    net: 390.25
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
        className="space-y-16"
      >
        <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        <JoinGroupModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />

        <header className="flex flex-col gap-4">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="w-10 h-1 bg-[#6366F1] rounded-full" />
            <span className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.4em]">Summary Insights</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-7xl font-bold tracking-[-0.05em] text-[#0F172A] leading-[1] max-w-4xl">
            MANAGE YOUR <span className="text-slate-400 font-light">EXPENSES.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-500 text-xl font-medium max-w-2xl mt-4">
            Easily track shared expenses and settle balances with your friends.
          </motion.p>
        </header>

        {/* Summary HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          {[
            { label: 'Owed to You', value: mockSummary.oweToMe, color: '#0F172A', accent: '#6366F1' },
            { label: 'You Owe', value: mockSummary.iOwe, color: '#0F172A', accent: '#EC4899' },
            { label: 'Total Balance', value: mockSummary.net, color: '#0F172A', accent: '#84CC16' }
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass-card p-10 group flex flex-col justify-between min-h-[200px]"
            >
              <div className="flex items-center justify-between mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{card.label}</p>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.accent }} />
              </div>
              <div className="space-y-1">
                <div className="text-5xl font-bold tracking-tighter" style={{ color: card.color }}>₹{card.value.toLocaleString()}</div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    className="h-full"
                    style={{ backgroundColor: card.accent }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Circles Interface */}
        <section className="space-y-12">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="flex items-center gap-6">
              <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">YOUR EXPENSE GROUPS</h2>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 tracking-widest">{getGroups.data?.length || 0} ACTIVE</span>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="btn-secondary"
              >
                JOIN GROUP
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                + CREATE GROUP
              </button>
            </div>
          </div>

          {getGroups.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse"></div>)}
            </div>
          ) : getGroups.data?.length === 0 ? (
            <motion.div variants={itemVariants} className="glass-card text-center py-32 bg-slate-50/50 border-dashed">
              <div className="text-slate-400 text-xl font-bold mb-10 tracking-tight">Got no groups yet! Create one.</div>
              <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">Create Group</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getGroups.data?.map(group => (
                <motion.div
                  key={group.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="glass-card group cursor-pointer hover:bg-white p-8"
                >
                  <div className="flex items-start justify-between mb-10">
                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-2xl font-black text-[#0F172A] border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all duration-500">
                      {group.name[0]}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector</span>
                      <span className="text-[11px] font-black text-[#6366F1] uppercase tracking-widest">{group.category}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-2xl mb-4 text-[#0F172A] group-hover:tracking-tight transition-all">{group.name}</h3>
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-10 leading-relaxed">{group.description || "High-performance synchronization for your shared ecosystem."}</p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />)}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{group.members_count} Nodes</span>
                    </div>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      ACTV / {new Date(group.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </motion.div>

    </Layout>
  );
};

export default Dashboard;