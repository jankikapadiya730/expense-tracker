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

  // Process data for spending over time (last 7 days/entries)
  const timeData = expenses.slice(0, 7).reverse().map(e => ({
    name: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: parseFloat(e.amount)
  }));

  const COLORS = ['#7C3AED', '#84CC16', '#F43F5E', '#06B6D4', '#EAB308', '#A855F7'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      <div className="glass-card p-6 min-h-[300px]">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Spending by Category</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{entry.name}</span>
                </div>
            ))}
        </div>
      </div>

      <div className="glass-card p-6 min-h-[300px]">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Recent Activity</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData}>
              <XAxis dataKey="name" stroke="#484f58" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                 cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }}
                 contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '12px' }}
                 itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="amount" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
