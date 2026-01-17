
import React, { useMemo, useState } from 'react';
import { Sparkles, Calendar, Clock, ArrowRight, Settings, Bell, Music, History } from 'lucide-react';
import { MoodRecord, User, AnalysisResult, UserSettings } from '../types';
import { MOOD_EMOJIS, MOOD_COLORS } from '../constants';
import MusicPlayer from './MusicPlayer';

interface StudentDashboardProps {
  user: User;
  records: MoodRecord[];
  lastResult: AnalysisResult | null;
  onOpenCheckIn: () => void;
  onUpdateSettings: (settings: UserSettings) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, records, lastResult, onOpenCheckIn, onUpdateSettings }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const currentMood = useMemo(() => {
    if (records.length === 0) return null;
    return records[records.length - 1];
  }, [records]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdateSettings({
      ...user.settings!,
      [name]: value
    });
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-lg text-gray-500 mt-1">Your emotional sanctuary is ready.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Sparkles size={16} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings size={16} /> Preferences
          </button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Mood Insight */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                {currentMood ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner backdrop-blur-md">
                        {MOOD_EMOJIS[currentMood.mood]}
                      </div>
                      <div>
                        <h2 className="text-5xl font-black">{currentMood.mood}</h2>
                        <p className="text-indigo-200 font-medium">Last updated {new Date(currentMood.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 max-w-2xl">
                      <p className="text-xl font-light leading-relaxed text-indigo-50">
                        {lastResult?.explanation || 'Refining your mood analysis...'}
                      </p>
                    </div>
                    <button 
                      onClick={onOpenCheckIn}
                      className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg hover:translate-x-1"
                    >
                      New Check-in <ArrowRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Bell size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">You're due for a check-in</h2>
                    <p className="text-indigo-200 max-w-sm mb-8">
                      Tell us how you're feeling to unlock personalized music therapy and stress management insights.
                    </p>
                    <button 
                      onClick={onOpenCheckIn}
                      className="px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-2xl"
                    >
                      Start Check-in
                    </button>
                  </div>
                )}
              </div>
              
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>
            </div>

            {/* History Feed */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <History className="text-indigo-600" />
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Reflection Timeline</h3>
              </div>
              <div className="space-y-4">
                {records.slice().reverse().map((record) => (
                  <div key={record.id} className="flex items-center gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors group">
                    <div className={`w-14 h-14 ${MOOD_COLORS[record.mood]} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                      {MOOD_EMOJIS[record.mood]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-lg">{record.mood}</h4>
                        <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1 italic">
                        {record.input || 'No specific notes shared.'}
                      </p>
                    </div>
                  </div>
                ))}
                {records.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">Your timeline is empty. Start a check-in to see history.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Bar */}
          <div className="lg:col-span-4 space-y-8">
            {lastResult && (
              <MusicPlayer recommendations={lastResult.recommendations} />
            )}

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-xl">
                <Bell size={20} className="text-indigo-600" />
                Next Check-in
              </h4>
              <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900">Scheduled for</p>
                  <p className="text-lg font-black text-indigo-600 uppercase tracking-tight">Next Monday</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Consistency helps us identify patterns in your well-being. Don't skip your reminders!
              </p>
              <button 
                onClick={onOpenCheckIn}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl"
              >
                Instant Update
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Bell className="text-indigo-600" /> Notification Settings
          </h2>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">Check-in Frequency</label>
              <select 
                name="checkInFrequency"
                value={user.settings?.checkInFrequency}
                onChange={handleSettingsChange}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              >
                <option value="Daily">Daily Reflections (Best for stress)</option>
                <option value="Weekly">Weekly Check-in (Recommended)</option>
                <option value="Bi-weekly">Bi-weekly (Non-intrusive)</option>
              </select>
              <p className="text-xs text-gray-400 mt-2 italic">Choose how often you'd like to receive mood notifications.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">Preferred Time</label>
              <input 
                type="time" 
                name="preferredTime"
                value={user.settings?.preferredTime}
                onChange={handleSettingsChange}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
              />
              <p className="text-xs text-gray-400 mt-2 italic">We'll send your reminders at this specific time.</p>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h4 className="text-emerald-900 font-bold mb-1">Your data is private</h4>
                <p className="text-emerald-700 text-sm">Only your branch leader can see overall trends to support you. Your detailed reflections stay with you.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
