
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, AlertCircle, Search, Copy, CheckCircle } from 'lucide-react';
import { MoodRecord, User } from '../types';
import { MOOD_COLORS, MOOD_EMOJIS } from '../constants';

interface LeaderDashboardProps {
  leader: User;
  records: MoodRecord[];
  allUsers: User[];
}

const LeaderDashboard: React.FC<LeaderDashboardProps> = ({ leader, records, allUsers }) => {
  const [copied, setCopied] = React.useState(false);

  const branchStudents = useMemo(() => {
    return allUsers.filter(u => u.vouchedBy === leader.referralCode);
  }, [allUsers, leader.referralCode]);

  const branchRecords = useMemo(() => {
    const studentIds = new Set(branchStudents.map(s => s.id));
    return records.filter(r => studentIds.has(r.studentId)); 
  }, [records, branchStudents]);

  const moodStats = useMemo(() => {
    const stats: Record<string, number> = {
      Happy: 0, Stressed: 0, Anxious: 0, Sad: 0, Neutral: 0, Calm: 0
    };
    branchRecords.forEach(r => stats[r.mood] = (stats[r.mood] || 0) + 1);
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [branchRecords]);

  const recentAlerts = useMemo(() => {
    return branchRecords
      .filter(r => r.mood === 'Stressed' || r.mood === 'Sad' || r.mood === 'Anxious')
      .slice(0, 5)
      .map(r => ({
        ...r,
        studentName: branchStudents.find(s => s.id === r.studentId)?.name || 'Unknown'
      }));
  }, [branchRecords, branchStudents]);

  const copyReferral = () => {
    if (leader.referralCode) {
      navigator.clipboard.writeText(leader.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Leader Console</h1>
          <p className="text-gray-500 font-medium">Empowering students in <span className="text-indigo-600">{leader.branch}</span></p>
        </div>
        
        <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-xl flex items-center gap-4 border border-indigo-400">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Your Vouch Code</p>
            <p className="text-xl font-black tracking-tighter">{leader.referralCode}</p>
          </div>
          <button 
            onClick={copyReferral}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            title="Copy Code"
          >
            {copied ? <CheckCircle size={20} className="text-emerald-400" /> : <Copy size={20} />}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={20}/></div>
            <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">My Students</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{branchStudents.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={20}/></div>
            <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Active Trends</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{branchRecords.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertCircle size={20}/></div>
            <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Urgent Alerts</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{recentAlerts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Emotional Landscape</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={45}>
                  {moodStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} className={MOOD_COLORS[entry.name as keyof typeof MOOD_COLORS]} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2 tracking-tight">
            Support Feed
          </h3>
          <div className="space-y-4">
            {recentAlerts.length > 0 ? recentAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-5 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                <span className="text-3xl drop-shadow-sm">{MOOD_EMOJIS[alert.mood]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-gray-900 truncate">{alert.studentName}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(alert.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed italic">"{alert.input || 'Check-in without notes.'}"</p>
                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100">Reach Out</button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50">Dismiss</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No urgent attention required</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;
