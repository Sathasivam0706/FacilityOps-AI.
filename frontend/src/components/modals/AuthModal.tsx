import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { loginApi, registerApi } from '../../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Facility Manager' | 'Chief Engineer' | 'Maintenance Tech' | 'Energy Analyst'>('Facility Manager');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = (demoRole: 'Facility Manager' | 'Chief Engineer' | 'Maintenance Tech') => {
    setEmail(`${demoRole.toLowerCase().replace(' ', '.')}@apexhighrise.com`);
    setPassword('demoPass123!');
    setName(demoRole === 'Facility Manager' ? 'Sarah Jenkins' : demoRole === 'Chief Engineer' ? 'Marcus Vance' : 'Dave Miller');
    setRole(demoRole);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const res = await loginApi(email, password);
        if (res.success && res.user) {
          setSuccessMsg('Successfully authenticated!');
          setTimeout(() => {
            onLoginSuccess(res.user);
            setSuccessMsg(null);
            onClose();
          }, 600);
        } else {
          setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
        }
      } else {
        const res = await registerApi(name, email, password, role);
        if (res.success && res.user) {
          setSuccessMsg('Account registered successfully!');
          setTimeout(() => {
            onLoginSuccess(res.user);
            setSuccessMsg(null);
            onClose();
          }, 600);
        } else {
          setErrorMsg(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMsg('Network or server error during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg border border-slate-700">
              <Building2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {mode === 'login' ? 'FacilityOps Portal Login' : 'Create Technician Account'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {mode === 'login' ? 'Access multi-agent operational telemetry' : 'Register new facility manager credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick Fills */}
        {mode === 'login' && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Quick Demo Accounts:
            </label>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoLogin('Facility Manager')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold text-center cursor-pointer transition-colors"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Chief Engineer')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold text-center cursor-pointer transition-colors"
              >
                Engineer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Maintenance Tech')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold text-center cursor-pointer transition-colors"
              >
                Tech
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="s.jenkins@apexhighrise.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Role / Permissions</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="Facility Manager">Facility Manager (Full Access)</option>
                <option value="Chief Engineer">Chief Engineer (HVAC / BMS)</option>
                <option value="Maintenance Tech">Maintenance Technician (Work Orders)</option>
                <option value="Energy Analyst">Energy Analyst (Reporting)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center space-x-2 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center space-x-2 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-cyan-700 hover:text-cyan-800 font-bold text-xs underline cursor-pointer"
            >
              {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign In'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Register Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
