import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function LoginPage() {
  const { login, verifyTfaLogin, loginDemo, tfaChallenge, cancelTfaChallenge, isLoading } =
    useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
      toast.error(err.message || 'Authentication error');
    }
  };

  const handleTfaSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!tfaCode.trim() || tfaCode.length < 6) {
      setError('Please enter the 6-digit code from your authenticator app');
      return;
    }

    try {
      await verifyTfaLogin(tfaCode.trim());
    } catch (err) {
      setError(err.message || 'Invalid 2FA code. Please try again.');
      toast.error(err.message || 'Invalid code');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass-dropdown bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/25 mb-4 animate-glow">
              <Layers className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-white tracking-tight">
              4PRINTS Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage catalog, administrators, and security
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Normal Credentials Login */}
          {!tfaChallenge ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Admin Email"
                type="email"
                icon={Mail}
                placeholder="admin@4prints.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                icon={ArrowRight}
              >
                Sign In to Console
              </Button>
            </form>
          ) : (
            /* Step 2: 2FA TOTP Challenge */
            <form onSubmit={handleTfaSubmit} className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 text-indigo-400" />
                <span>
                  Two-Factor Authentication is enabled on your account. Enter the 6-digit code from Google Authenticator.
                </span>
              </div>

              <Input
                label="Authenticator Code (TOTP)"
                type="text"
                maxLength={6}
                icon={KeyRound}
                placeholder="123456"
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                icon={ShieldCheck}
              >
                Verify & Continue
              </Button>

              <button
                type="button"
                onClick={cancelTfaChallenge}
                className="w-full text-xs text-slate-400 hover:text-slate-200 text-center py-2 transition-colors"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <span className="bg-slate-900 px-3">or instant exploration</span>
            </div>
          </div>

          {/* Demo Mode Button */}
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="w-full flex items-center justify-center gap-2 border-indigo-500/30 hover:border-indigo-500/60"
            onClick={loginDemo}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Launch Offline Demo Mode</span>
          </Button>

          <p className="text-[11px] text-slate-500 text-center mt-5">
            Backend API default: <code className="text-slate-400">http://localhost:3000</code>
          </p>
        </div>
      </div>
    </div>
  );
}
