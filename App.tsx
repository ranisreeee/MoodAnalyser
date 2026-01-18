
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, MoodRecord, AnalysisResult, UserSettings } from './types';
import { MOCK_STUDENTS, MOCK_LEADERS } from './constants';
import StudentDashboard from './components/StudentDashboard';
import LeaderDashboard from './components/LeaderDashboard';
import MoodCheckInModal from './components/MoodCheckInModal';
import { LogOut, User as UserIcon, Heart, UserPlus, ShieldCheck, Mail, Lock, Building } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [vouchCode, setVouchCode] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');
  
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);

  // Persistence - Load from storage
  useEffect(() => {
    const savedRecords = localStorage.getItem('sentience_records');
    if (savedRecords) setMoodRecords(JSON.parse(savedRecords));

    const savedUsers = localStorage.getItem('sentience_all_users');
    if (savedUsers) {
      setAllUsers(JSON.parse(savedUsers));
    } else {
      const initialUsers = [...MOCK_STUDENTS, ...MOCK_LEADERS];
      setAllUsers(initialUsers);
      localStorage.setItem('sentience_all_users', JSON.stringify(initialUsers));
    }

    const savedUser = localStorage.getItem('sentience_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const savedAnalysis = localStorage.getItem('sentience_last_analysis');
    if (savedAnalysis) setLastAnalysis(JSON.parse(savedAnalysis));
  }, []);

  const triggerNotification = useCallback(() => {
    if (Notification.permission === 'granted') {
      new Notification("Sentience: Time to Check-in", {
        body: "Your emotional well-being matters. Take a moment to reflect.",
        icon: "/favicon.ico"
      });
    }
    setShowCheckIn(true);
  }, []);

  // Check if we should trigger a "Weekly Popup"
  useEffect(() => {
    if (currentUser?.role === UserRole.STUDENT) {
      const lastCheck = localStorage.getItem('sentience_last_checkin');
      const now = Date.now();
      
      const freq = currentUser.settings?.checkInFrequency || 'Weekly';
      const intervals: Record<string, number> = {
        'Daily': 24 * 60 * 60 * 1000,
        'Weekly': 7 * 24 * 60 * 60 * 1000,
        'Bi-weekly': 14 * 24 * 60 * 60 * 1000,
      };
      
      const waitTime = intervals[freq];
      
      if (!lastCheck || (now - parseInt(lastCheck)) > waitTime) {
        // Request notification permission if not yet decided
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
        
        const timer = setTimeout(triggerNotification, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, triggerNotification]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (allUsers.find(u => u.email === email)) {
        setError('Email already exists.');
        return;
      }

      let referralCode = '';
      let vouchedBy = '';
      let finalBranch = branch;

      if (role === UserRole.STUDENT) {
        const leader = allUsers.find(u => u.referralCode === vouchCode && u.role === UserRole.LEADER);
        if (!leader) {
          setError('Invalid Vouch Code. Please get a code from your branch leader.');
          return;
        }
        vouchedBy = leader.referralCode!;
        finalBranch = leader.branch || 'Unknown';
      } else {
        referralCode = `${branch.slice(0, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role,
        branch: finalBranch,
        referralCode,
        vouchedBy,
        settings: { checkInFrequency: 'Weekly', preferredTime: '09:00' }
      };

      const updatedUsers = [...allUsers, newUser];
      setAllUsers(updatedUsers);
      localStorage.setItem('sentience_all_users', JSON.stringify(updatedUsers));
      setCurrentUser(newUser);
      localStorage.setItem('sentience_user', JSON.stringify(newUser));
    } else {
      const user = allUsers.find(u => u.email === email);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('sentience_user', JSON.stringify(user));
      } else {
        setError('Invalid credentials.');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sentience_user');
  };

  const handleSettingsUpdate = (newSettings: UserSettings) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, settings: newSettings };
    setCurrentUser(updatedUser);
    const updatedUsers = allUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    setAllUsers(updatedUsers);
    localStorage.setItem('sentience_all_users', JSON.stringify(updatedUsers));
    localStorage.setItem('sentience_user', JSON.stringify(updatedUser));
  };

  const handleMoodComplete = (result: AnalysisResult, input: string, rating: number) => {
    const newRecord: MoodRecord = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: currentUser!.id,
      timestamp: new Date().toISOString(),
      mood: result.mood,
      input,
      rating
    };

    const updated = [...moodRecords, newRecord];
    setMoodRecords(updated);
    setLastAnalysis(result);
    setShowCheckIn(false);
    
    localStorage.setItem('sentience_records', JSON.stringify(updated));
    localStorage.setItem('sentience_last_analysis', JSON.stringify(result));
    localStorage.setItem('sentience_last_checkin', Date.now().toString());
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fdfdff] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-12 border border-slate-100/50 animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200 rotate-6 transition-transform hover:rotate-12 cursor-pointer">
              <Heart className="text-white fill-white" size={48} />
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">SENTIENCE</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">Emotional Intelligence Hub</p>
          </div>

          <div className="flex bg-slate-100/50 p-2 rounded-[2rem] mb-10 border border-slate-100">
            <button 
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300 ${!isRegistering ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Enter
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300 ${isRegistering ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Join
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {isRegistering && (
              <>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.STUDENT)}
                    className={`flex-1 py-4 px-2 rounded-2xl border text-[11px] font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all duration-300 ${role === UserRole.STUDENT ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                  >
                    <UserIcon size={16}/> Student
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.LEADER)}
                    className={`flex-1 py-4 px-2 rounded-2xl border text-[11px] font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all duration-300 ${role === UserRole.LEADER ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                  >
                    <ShieldCheck size={16}/> Leader
                  </button>
                </div>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-indigo-600" size={20} />
                  <input
                    type="text" required
                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-800"
                    placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {role === UserRole.LEADER ? (
                  <div className="relative group">
                    <Building className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-indigo-600" size={20} />
                    <input
                      type="text" required
                      className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-800"
                      placeholder="Branch / Department" value={branch} onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="relative group">
                    <UserPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-indigo-600" size={20} />
                    <input
                      type="text" required
                      className="w-full pl-14 pr-6 py-5 bg-indigo-50/30 border border-indigo-100 rounded-[2rem] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-indigo-600 placeholder:text-indigo-200"
                      placeholder="Leader Vouch Code" value={vouchCode} onChange={(e) => setVouchCode(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-indigo-600" size={20} />
              <input
                type="email" required
                className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-800"
                placeholder="Academic Email" value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-indigo-600" size={20} />
              <input
                type="password" required
                className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-800"
                placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-5 rounded-3xl text-xs font-black uppercase tracking-wider border border-rose-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] text-[11px]"
            >
              {isRegistering ? 'Begin Journey' : 'Access Sanctuary'}
            </button>
          </form>

          {!isRegistering && (
            <div className="mt-12 pt-10 border-t border-slate-50 text-center">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em] leading-loose">
                Instant Access for Demo<br/>
                <span className="text-gray-400">student@example.com / leader@example.com</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 transition-transform group-hover:scale-110">
                <Heart className="text-white fill-white" size={28} />
              </div>
              <span className="text-3xl font-black tracking-tighter text-gray-900 group-hover:text-indigo-600 transition-colors">SENTIENCE</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-lg font-black text-gray-900 tracking-tight">{currentUser.name}</span>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-4 py-1.5 rounded-full uppercase tracking-[0.15em] border border-indigo-100">
                  {currentUser.role} • {currentUser.branch}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all border border-transparent hover:border-rose-100 group"
                title="Log out"
              >
                <LogOut size={28} className="transition-transform group-hover:rotate-12" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-24 pt-8">
        {currentUser.role === UserRole.STUDENT ? (
          <StudentDashboard 
            user={currentUser} 
            records={moodRecords.filter(r => r.studentId === currentUser.id)}
            lastResult={lastAnalysis}
            onOpenCheckIn={() => setShowCheckIn(true)}
            onUpdateSettings={handleSettingsUpdate}
          />
        ) : (
          <LeaderDashboard 
            leader={currentUser} 
            records={moodRecords}
            allUsers={allUsers}
          />
        )}
      </main>

      {showCheckIn && (
        <MoodCheckInModal 
          onClose={() => setShowCheckIn(false)} 
          onComplete={handleMoodComplete} 
        />
      )}

      <footer className="text-center pb-16 pt-16 border-t border-slate-100 max-w-2xl mx-auto px-6">
        <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em] leading-loose">
          Cultivating Academic Excellence through Emotional Wellness
        </p>
      </footer>
    </div>
  );
};

export default App;
