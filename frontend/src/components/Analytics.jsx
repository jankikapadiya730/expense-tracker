import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Analytics = ({ expenses }) => {
  if (!expenses || expenses.length === 0) return null;

  // Process data for category pie chart
  const categoryData = expenses.reduce((acc, curr) => {
    const category = curr.category || 'other';
    const found = acc.find(item => item.name === category);
    if (found) found.value += parseFloat(curr.amount);
    else acc.push({ name: category, value: parseFloat(curr.amount) });
    return acc;
  }, []);

  // Process data for spending (last 7 entries)
  const timeData = expenses.slice(0, 7).reverse().map(e => ({
    name: e.title.length > 10 ? e.title.substring(0, 8) + '...' : e.title,
    fullTitle: e.title,
    amount: parseFloat(e.amount)
  }));

  const COLORS = ['#0F172A', '#6366F1', '#94A3B8', '#1E293B', '#4F46E5', '#334155'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
      <div className="glass-card p-8 min-h-[350px] bg-white/40 border-slate-200/50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Spending by Category</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
                itemStyle={{ color: '#0F172A', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-8 justify-center">
            {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 dark:bg-slate-900/50">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{entry.name}</span>
                </div>
            ))}
        </div>
      </div>

      <div className="glass-card p-8 min-h-[350px] bg-white/40 border-slate-200/50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Recent Expenses</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
              <YAxis hide />
              <Tooltip 
                 cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 8 }}
                 contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
                 itemStyle={{ color: '#0F172A', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}
                 formatter={(value, name, props) => [`₹${value.toLocaleString()}`, props.payload.fullTitle]}
              />
              <Bar dataKey="amount" fill="#0F172A" radius={[20, 20, 20, 20]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
