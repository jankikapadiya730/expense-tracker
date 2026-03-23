import React from 'react';
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
        className="space-y-12"
      >
        <header className="flex flex-col gap-1">
          <motion.h1 variants={itemVariants} className="text-4xl font-black tracking-tight">
            Welcome back, <span className="text-[#7C3AED]">{user?.first_name || user?.username}</span>!
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-400 text-lg">
            Here's what's happening in your circles today.
          </motion.p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'You are owed', value: mockSummary.oweToMe, color: '#84CC16', bg: 'bg-[#84CC16]/10' },
            { label: 'You owe', value: mockSummary.iOwe, color: '#F43F5E', bg: 'bg-[#F43F5E]/10' },
            { label: 'Net Balance', value: mockSummary.net, color: '#7C3AED', bg: 'bg-[#7C3AED]/10' }
          ].map((card, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:scale-150`}></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
              <div className="text-4xl font-black" style={{ color: card.color }}>₹{card.value.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>

        {/* Groups Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Your Groups</h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsJoinModalOpen(true)}
                className="btn-secondary px-6 py-2.5 rounded-xl font-bold text-sm"
              >
                Join Code
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#7C3AED]/20"
              >
                Create Group
              </button>
            </div>
          </div>

          <CreateGroupModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
          />

          <JoinGroupModal 
            isOpen={isJoinModalOpen} 
            onClose={() => setIsJoinModalOpen(false)} 
          />

          {getGroups.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="glass-card h-48 animate-pulse bg-gray-800/50"></div>)}
            </div>
          ) : getGroups.data?.length === 0 ? (
            <motion.div variants={itemVariants} className="glass-card text-center py-20 bg-gray-900/20 border-dashed border-2 border-gray-800">
              <div className="text-gray-500 text-lg mb-6">No active groups found.</div>
              <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary px-8 py-3 rounded-xl font-bold">Start Your First Group</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getGroups.data?.map(group => (
                <motion.div 
                  key={group.id} 
                  variants={itemVariants}
                  whileHover={{ y: -5, borderColor: 'rgba(124, 58, 237, 0.4)' }}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="glass-card group cursor-pointer hover:bg-[#1C2128] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-gray-800 rounded-2xl overflow-hidden font-bold flex items-center justify-center text-2xl text-[#7C3AED] ring-1 ring-gray-700">
                      {group.name[0]}
                    </div>
                    <span className="text-[10px] px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-black border border-[#7C3AED]/20 uppercase tracking-widest">
                      {group.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-[#7C3AED] transition-colors">{group.name}</h3>
                  <div className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">{group.description || "Track shared expenses and settle balances effortlessly."}</div>
                  <div className="flex items-center justify-between text-[10px] font-black text-gray-400 pt-5 border-t border-gray-800 uppercase tracking-widest">
                    <span>{group.members_count} Members</span>
                    <span>{new Date(group.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
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
