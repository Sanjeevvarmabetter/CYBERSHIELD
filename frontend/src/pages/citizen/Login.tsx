import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role: 'citizen' | 'analyst' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@cybershield.org');
      setPassword('CybershieldAdmin2026!');
    } else if (role === 'analyst') {
      setEmail('analyst@cybershield.org');
      setPassword('CybershieldAnalyst2026!');
    } else {
      setEmail('citizen@cybershield.org');
      setPassword('CitizenSafe2026!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-navy-800 border border-cyan-500/30 text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In to CYBERSHIELD</h2>
          <p className="text-xs text-slate-400">Secure Argon2id authentication & audit-logged access</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div className="pt-4 border-t border-navy-800 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center">
            Demo Credentials (1-Click Fill)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('citizen')}
              className="py-1.5 px-2 bg-navy-950 hover:bg-navy-800 border border-navy-700 rounded text-[11px] text-slate-300 transition"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('analyst')}
              className="py-1.5 px-2 bg-navy-950 hover:bg-navy-800 border border-cyan-800/60 rounded text-[11px] text-cyan-300 transition"
            >
              Analyst
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1.5 px-2 bg-navy-950 hover:bg-navy-800 border border-purple-800/60 rounded text-[11px] text-purple-300 transition"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Need an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
