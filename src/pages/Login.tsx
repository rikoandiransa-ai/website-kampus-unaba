import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User as UserIcon, AlertCircle, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both your Username/SIM and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Incorrect username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative colored grid / backdrop accent blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-3xl -z-10" />

      <div className="w-full max-w-2xl text-center mb-8">
        {/* 50px Font display bold black as explicitly requested for UNIVERSITAS ANAK BANGSA */}
        <h1 className="text-[50px] font-extrabold text-black uppercase tracking-tight leading-none mb-1">
          UNIVERSITAS ANAK BANGSA
        </h1>
        <p className="text-orange-600 font-bold tracking-widest text-sm uppercase">
          Sistem Informasi Aktivitas & Presensi Kampus
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-950 p-6 text-white text-center relative">
          <div className="mx-auto w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold">Portal Login Akademik</h2>
          <p className="text-slate-300 text-xs mt-1">Please authenticate with your Username or SIM ID</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-sm text-red-600 animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Username / SIM ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Admin or Username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verifying Session...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Explicit Credentials Helper Box - cleanly formatted */}
          <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
              System Access Credentials
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-center">
                <p className="font-semibold text-slate-700 mb-0.5">Admin Account</p>
                <p className="font-mono text-blue-600">Admin</p>
                <p className="font-mono text-slate-600">unaba123</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-center">
                <p className="font-semibold text-slate-700 mb-0.5">Student Account</p>
                <p className="font-mono text-blue-600">riko</p>
                <p className="font-mono text-slate-600">student123</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <p className="text-xs text-slate-400 mt-12 text-center">
        &copy; 2026 Universitas Anak Bangsa. All rights reserved.<br />
        Designed for academic activity records, tracking, and certification.
      </p>
    </div>
  );
};
