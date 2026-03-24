import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroups } from '../hooks/useGroups';
import { Loader2 } from 'lucide-react';
import Layout from '../components/Layout';

const JoinGroup = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { joinGroup } = useGroups();
  const hasAttemptedJoin = useRef(false);

  useEffect(() => {
    if (inviteCode && !hasAttemptedJoin.current) {
      hasAttemptedJoin.current = true;
      joinGroup.mutate(inviteCode, {
        onSuccess: (data) => {
          navigate(`/groups/${data.id}`);
        },
        onError: (error) => {
          console.error('Failed to join group:', error);
          alert(error.response?.data?.detail || 'Failed to join group. The code might be invalid.');
          navigate('/');
        }
      });
    }
  }, [inviteCode, joinGroup, navigate]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="w-20 h-20 bg-[#0F172A] rounded-full flex items-center justify-center shadow-xl">
           <Loader2 className="text-white animate-spin" size={40} />
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#0F172A] tracking-tight uppercase">Authorizing Access</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Establishing secure link to network node...</p>
        </div>
      </div>
    </Layout>
  );
};

export default JoinGroup;
