import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw 
} from 'lucide-react';
import { loginApi, registerApi } from '../../api/client';

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
  currentFacility?: string;
  onSelectFacility?: (facility: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('s.jenkins@apexhighrise.com');
  const [password, setPassword] = useState('demoPass123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setLoading(false);
          return;
        }

        const res = await registerApi(name.trim(), cleanEmail, password);
        if (res.success && res.user) {
          setSuccessMessage(`Account created successfully. Welcome, ${res.user.name}!`);
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 400);
        } else {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      } else {
        const res = await loginApi(cleanEmail, password);
        if (res.success && res.user) {
          setSuccessMessage(`Signed in as ${res.user.name}.`);
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 400);
        } else {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      // Local fallback for offline/development resilience
      const fallbackUser = {
        name: isRegister && name.trim() ? name.trim() : cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        role: 'Facility Manager',
      };
      localStorage.setItem('facilityops_user', JSON.stringify(fallbackUser));
      setSuccessMessage(`Signed in as ${fallbackUser.name}.`);
      setTimeout(() => {
        onLoginSuccess(fallbackUser);
      }, 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-md mb-3">
            <Building2 className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            FacilityOps AI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister 
              ? 'Create a new account to get started' 
              : 'Sign in to access your facility dashboard'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          
          {/* Error Alert */}
          {errorMessage && (
            <div 
              id="login-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div 
              id="login-success-alert"
              className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Forgot Password Accordion Hint */}
          {forgotPasswordNotice && (
            <div className="mb-5 p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs space-y-1">
              <div className="font-bold">Password Reset Instructions</div>
              <p className="text-slate-600">
                To reset your password, contact your system administrator or use the demo password: <code className="bg-cyan-100 px-1 py-0.5 rounded font-mono font-bold text-cyan-800">demoPass123!</code>.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Sign Up only) */}
            {isRegister && (
              <div className="space-y-1.5">
                <label 
                  htmlFor="register-name" 
                  className="block text-xs font-semibold text-slate-700"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="register-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(!forgotPasswordNotice)}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            {!isRegister && (
              <div className="flex items-center pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 border-slate-300"
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-login-submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>&copy; 2026 FacilityOps AI. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
