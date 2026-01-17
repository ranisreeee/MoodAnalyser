
import React, { useState, useEffect } from 'react';
import { User, UserRole, MoodRecord, AnalysisResult, UserSettings } from './types';
import { MOCK_STUDENTS, MOCK_LEADERS } from './constants';
import StudentDashboard from './components/StudentDashboard';
import LeaderDashboard from './components/LeaderDashboard';
import MoodCheckInModal from './components/MoodCheckInModal';
import { LogOut, LayoutDashboard, User as UserIcon, Heart, UserPlus, ShieldCheck, Mail, Lock, Building } from 'lucide-react';

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
        const timer = setTimeout(() => setShowCheckIn(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      // Registration Logic
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
        // Generate random Referral Code for Leaders
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
      // Login Logic
      const user = allUsers.find(u => u.email === email);
      if (user && password.length > 0) {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200 rotate-3 transition-transform hover:rotate-6">
              <Heart className="text-white fill-white" size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">SENTIENCE</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Mood & Well-being Sanctuary</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isRegistering ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isRegistering ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.STUDENT)}
                    className={`flex-1 py-3 px-2 rounded-xl border text-[10px] font-bold uppercase tracking-tight flex items-center justify-center gap-1 transition-all ${role === UserRole.STUDENT ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    <UserIcon size={14}/> Student
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.LEADER)}
                    className={`flex-1 py-3 px-2 rounded-xl border text-[10px] font-bold uppercase tracking-tight flex items-center justify-center gap-1 transition-all ${role === UserRole.LEADER ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    <ShieldCheck size={14}/> Leader
                  </button>
                </div>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" size={18} />
                  <input
                    type="text" required
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-800"
                    placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {role === UserRole.LEADER ? (
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" size={18} />
                    <input
                      type="text" required
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-800"
                      placeholder="Branch / Department" value={branch} onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="relative group">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" size={18} />
                    <input
                      type="text" required
                      className="w-full pl-12 pr-5 py-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-indigo-600 placeholder:text-indigo-300"
                      placeholder="Vouch Code (from Leader)" value={vouchCode} onChange={(e) => setVouchCode(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" size={18} />
              <input
                type="email" required
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-800"
                placeholder="Academic Email" value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" size={18} />
              <input
                type="password" required
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-800"
                placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-red-100 flex items-center gap-2 animate-bounce">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-95 text-xs"
            >
              {isRegistering ? 'Create Account' : 'Enter Sanctuary'}
            </button>
          </form>

          {!isRegistering && (
            <div className="mt-10 pt-8 border-t border-slate-50 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                Demo Portal Access<br/>
                S: student@example.com<br/>
                L: leader@example.com
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200">
                <Heart className="text-white fill-white" size={24} />
              </div>
              <span className="text-3xl font-black tracking-tighter text-gray-900">SENTIENCE</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-base font-black text-gray-900 tracking-tight">{currentUser.name}</span>
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                  {currentUser.role} • {currentUser.branch}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                title="Log out"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-20">
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

      <footer className="text-center pb-12 border-t border-slate-100 pt-12 max-w-xl mx-auto">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
          Empowering Student Resilience through Emotional Intelligence
        </p>
      </footer>
    </div>
  );
};

export default App;
