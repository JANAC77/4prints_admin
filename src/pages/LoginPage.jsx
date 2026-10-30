import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import logoImg from '../assets/logo.png';
import loginIllustration from '../assets/login.webp';

export function LoginPage() {
  const { login, verifyTfaLogin, loginDemo, tfaChallenge, cancelTfaChallenge, isLoading } =
    useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tfaCode, setTfaCode] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
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
      setError('Please enter the 6-digit code from your authenticator app.');
      return;
    }

    try {
      await verifyTfaLogin(tfaCode.trim());
    } catch (err) {
      setError(err.message || 'Invalid 2FA code. Please try again.');
      toast.error(err.message || 'Invalid code');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@4prints.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex font-poppins bg-[#FDFBF6] text-[#111111] antialiased">
      {/* Left Column: Brand Illustration (Visible on desktop screens >= 1024px) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white overflow-hidden items-center justify-center p-8 lg:p-12 border-r border-[#E5E7EB]">
        {/* Top-Left Logo & Admin Badge */}
        <div className="absolute top-6 left-6 xl:top-8 xl:left-8 z-10 flex items-center gap-3">
          <img
            src={logoImg}
            alt="4Prints Logo"
            className="h-9 xl:h-11 w-auto object-contain"
          />
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#FFD40C] text-[#110C0B] shadow-xs">
            Admin Console
          </span>
        </div>

        {/* Hero Artwork */}
        <div className="w-full max-w-lg flex items-center justify-center mt-12">
          <img
            src={loginIllustration}
            alt="4Prints Storefront Illustration"
            className="w-full h-auto max-h-[75vh] object-contain drop-shadow-sm select-none"
          />
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center min-h-screen py-8 sm:py-12 px-6 sm:px-12 md:px-16 lg:px-12 xl:px-20 overflow-y-auto">
        {/* Mobile Header (Hidden on large screens) */}
        <div className="flex flex-col items-center justify-center w-full lg:hidden mb-8 shrink-0">
          <img
            src={logoImg}
            alt="4Prints Logo"
            className="h-10 sm:h-12 w-auto object-contain mb-2"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#FFD40C] text-[#110C0B] shadow-xs">
            Admin Console
          </span>
        </div>

        {/* Central Form Card */}
        <div className="w-full max-w-md mx-auto my-auto">
          {/* Header Typography */}
          <div className="mb-7 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#6B7280] text-xs sm:text-sm leading-relaxed">
              Please enter your credentials to access the 4PRINTS management console.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Standard Username & Password Login */}
          {!tfaChallenge ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5 cursor-pointer"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="admin@4prints.com"
                    required
                    autoFocus
                    autoComplete="email"
                    className="w-full py-2.5 pl-10 pr-4 bg-white border border-[#E5E7EB] hover:border-gray-400 focus:border-[#FFD40C] rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-all focus:ring-3 focus:ring-[#FFD40C]/25"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#374151] cursor-pointer"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-[11px] text-amber-700 hover:text-amber-800 hover:underline font-medium cursor-pointer"
                    title="Fill test credentials"
                  >
                    Autofill Demo Creds
                  </button>
                </div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full py-2.5 pl-10 pr-11 bg-white border border-[#E5E7EB] hover:border-gray-400 focus:border-[#FFD40C] rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-all focus:ring-3 focus:ring-[#FFD40C]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 mt-2 rounded-xl bg-[#110C0B] hover:bg-black text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-[#FFD40C] rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="w-4 h-4 text-[#FFD40C]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Two-Factor Authentication TOTP Challenge */
            <form onSubmit={handleTfaSubmit} className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-[#FFF3C4] border border-yellow-300 text-amber-950 text-xs sm:text-sm flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  Two-Factor Authentication is active. Enter the 6-digit verification code from your authenticator app.
                </span>
              </div>

              <div>
                <label
                  htmlFor="tfa-code-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5"
                >
                  Authenticator Code (TOTP)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="tfa-code-input"
                    type="text"
                    maxLength={6}
                    value={tfaCode}
                    onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full py-2.5 pl-10 pr-4 bg-white border border-[#E5E7EB] hover:border-gray-400 focus:border-[#FFD40C] rounded-xl text-gray-900 placeholder-gray-400 text-sm tracking-widest font-mono focus:outline-none transition-all focus:ring-3 focus:ring-[#FFD40C]/25"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-[#110C0B] hover:bg-black text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ShieldCheck className="w-4 h-4 text-[#FFD40C]" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={cancelTfaChallenge}
                className="w-full text-xs text-gray-500 hover:text-gray-800 text-center py-2 transition-colors cursor-pointer"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#FDFBF6] px-3 text-gray-400 font-medium tracking-wider text-[11px]">
                Or Instant Exploration
              </span>
            </div>
          </div>

          {/* 1-Click Offline Demo Mode Button */}
          <button
            type="button"
            onClick={loginDemo}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-300 hover:border-amber-400 bg-white hover:bg-[#FFF3C4]/30 text-gray-800 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-[#FFD40C]" />
            <span>Launch Offline Demo Mode</span>
          </button>

          {/* Backend Info Footer */}
          <p className="text-[11px] text-gray-400 text-center mt-6">
            Backend API: <code className="text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded font-mono">https://api.autoneu.in</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
