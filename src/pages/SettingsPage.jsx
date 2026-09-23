import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  ShieldAlert,
  Server,
  User,
  KeyRound,
  QrCode,
  Copy,
  Check,
  Sun,
  Moon,
  Laptop,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authApi } from '../api/auth.api.js';
import { checkBackendHealth, getApiBaseUrl, setApiBaseUrl } from '../api/client.js';
import { formatDate } from '../utils/formatters.js';

export function SettingsPage() {
  const { admin, isDemoMode, updateAdminProfileState, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  // API Config
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl() || 'http://localhost:3000');
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  // 2FA Setup Flow States
  const [isTfaSetupOpen, setIsTfaSetupOpen] = useState(false);
  const [isTfaDisableOpen, setIsTfaDisableOpen] = useState(false);
  const [tfaSetupData, setTfaSetupData] = useState(null); // { qrCodeDataUrl, secret }
  const [tfaVerifyCode, setTfaVerifyCode] = useState('');
  const [tfaDisableCode, setTfaDisableCode] = useState('');
  const [isSubmittingTfa, setIsSubmittingTfa] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl.trim());
    toast.success('API Base URL updated!');
    handleTestPing();
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    const res = await checkBackendHealth();
    setPingResult(res);
    setIsPinging(false);
    if (res.online) {
      toast.success(`Backend reached successfully! (${res.latency}ms latency)`);
    } else {
      toast.warning('Could not reach backend at the configured address.');
    }
  };

  const handleStartTfaSetup = async () => {
    if (isDemoMode) {
      setTfaSetupData({
        qrCodeDataUrl:
          'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/4Print%20Admin:admin@4prints.com?secret=JBSWY3DPEHPK3PXP&issuer=4Print%20Admin',
        secret: 'JBSWY3DPEHPK3PXP',
      });
      setIsTfaSetupOpen(true);
      return;
    }

    setIsSubmittingTfa(true);
    try {
      const res = await authApi.setupTfa();
      if (res.success && res.qrCodeDataUrl) {
        setTfaSetupData({
          qrCodeDataUrl: res.qrCodeDataUrl,
          secret: res.secret,
        });
        setIsTfaSetupOpen(true);
      } else {
        throw new Error(res.error?.message || 'Failed to initiate TFA setup');
      }
    } catch (err) {
      toast.error(err.message || 'Error initiating 2FA setup');
    } finally {
      setIsSubmittingTfa(false);
    }
  };

  const handleConfirmEnableTfa = async (e) => {
    e.preventDefault();
    if (!tfaVerifyCode || tfaVerifyCode.length < 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsSubmittingTfa(true);
    try {
      if (isDemoMode) {
        updateAdminProfileState({ tfaEnabled: true });
        toast.success('Two-Factor Authentication enabled in Demo!');
      } else {
        await authApi.enableTfa({ code: tfaVerifyCode.trim() });
        toast.success('Two-Factor Authentication enabled successfully!');
        await refreshProfile();
      }
      setIsTfaSetupOpen(false);
      setTfaVerifyCode('');
    } catch (err) {
      toast.error(err.message || 'Invalid 2FA code. Could not enable.');
    } finally {
      setIsSubmittingTfa(false);
    }
  };

  const handleConfirmDisableTfa = async (e) => {
    e.preventDefault();
    if (!tfaDisableCode || tfaDisableCode.length < 6) {
      toast.error('Please enter the 6-digit code to disable 2FA');
      return;
    }

    setIsSubmittingTfa(true);
    try {
      if (isDemoMode) {
        updateAdminProfileState({ tfaEnabled: false });
        toast.success('Two-Factor Authentication disabled in Demo');
      } else {
        await authApi.disableTfa({ code: tfaDisableCode.trim() });
        toast.success('Two-Factor Authentication disabled');
        await refreshProfile();
      }
      setIsTfaDisableOpen(false);
      setTfaDisableCode('');
    } catch (err) {
      toast.error(err.message || 'Invalid code. Could not disable 2FA.');
    } finally {
      setIsSubmittingTfa(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    toast.info('Secret key copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
          Settings & Security
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage administrator security, two-factor authentication, and backend server endpoints
        </p>
      </div>

      {/* 1. Admin Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center uppercase shadow-lg shadow-indigo-500/20">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
                {admin?.name || 'Administrator'}
              </h3>
              <p className="text-xs text-slate-400">{admin?.email}</p>
            </div>
          </div>
          <Badge variant="purple" size="md" className="uppercase font-bold">
            {admin?.role || 'Admin'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[11px] text-slate-400 block mb-0.5">Admin ID</span>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
              {admin?._id || 'N/A'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[11px] text-slate-400 block mb-0.5">Member Since</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatDate(admin?.createdAt)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[11px] text-slate-400 block mb-0.5">Last Login Time</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatDate(admin?.lastLogin)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Two-Factor Authentication (2FA) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
                  Two-Factor Authentication (TOTP)
                </h3>
                {admin?.tfaEnabled ? (
                  <Badge variant="success" size="sm">
                    Active & Protected
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Add an extra layer of security using Google Authenticator, Authy, or 1Password. A 6-digit TOTP code will be required upon signing in.
              </p>
            </div>
          </div>

          <div>
            {admin?.tfaEnabled ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsTfaDisableOpen(true)}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={QrCode}
                onClick={handleStartTfaSetup}
                isLoading={isSubmittingTfa}
              >
                Setup 2FA
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Backend API Connection */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
              Backend Fastify Server Target
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure the API address where 4Prints Fastify server is listening.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="API Base URL"
                  placeholder="http://localhost:3000"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" onClick={handleSaveApiUrl} size="md">
                  Save URL
                </Button>
                <Button
                  variant="outline"
                  icon={RefreshCw}
                  onClick={handleTestPing}
                  isLoading={isPinging}
                  size="md"
                >
                  Test Ping
                </Button>
              </div>
            </div>

            {pingResult && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  pingResult.online
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {pingResult.online ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>
                      Server is online! Ping latency:{' '}
                      <strong>{pingResult.latency}ms</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>
                      Could not connect to Fastify server. Ensure your backend is running on{' '}
                      <code>{apiUrl}</code>.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Appearance & Theme */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
          Appearance & Theme
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose your visual preference for the administrative workspace
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'system', label: 'System Sync', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2FA SETUP MODAL */}
      <Modal
        isOpen={isTfaSetupOpen}
        onClose={() => setIsTfaSetupOpen(false)}
        title="Setup Two-Factor Authentication"
        description="Scan the QR code with Google Authenticator or your authenticator app"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsTfaSetupOpen(false)}
              disabled={isSubmittingTfa}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="enable-tfa-form"
              isLoading={isSubmittingTfa}
            >
              Verify & Activate
            </Button>
          </>
        }
      >
        {tfaSetupData && (
          <form
            id="enable-tfa-form"
            onSubmit={handleConfirmEnableTfa}
            className="space-y-4"
          >
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200">
              <img
                src={tfaSetupData.qrCodeDataUrl}
                alt="2FA QR Code"
                className="w-44 h-44 rounded-lg"
              />
              <span className="text-[11px] text-slate-500 mt-2">
                Scan with Google Authenticator
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">
                Or enter secret key manually
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400 truncate">
                  {tfaSetupData.secret}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(tfaSetupData.secret)}
                >
                  {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Input
              label="Enter 6-Digit Authenticator Code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={tfaVerifyCode}
              onChange={(e) => setTfaVerifyCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </form>
        )}
      </Modal>

      {/* 2FA DISABLE CONFIRMATION MODAL */}
      <Modal
        isOpen={isTfaDisableOpen}
        onClose={() => setIsTfaDisableOpen(false)}
        title="Disable Two-Factor Authentication"
        description="Enter your current 6-digit TOTP code to confirm disabling 2FA."
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsTfaDisableOpen(false)}
              disabled={isSubmittingTfa}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              form="disable-tfa-form"
              isLoading={isSubmittingTfa}
            >
              Disable 2FA
            </Button>
          </>
        }
      >
        <form
          id="disable-tfa-form"
          onSubmit={handleConfirmDisableTfa}
          className="space-y-4"
        >
          <Input
            label="Current 6-Digit Code"
            type="text"
            maxLength={6}
            placeholder="123456"
            value={tfaDisableCode}
            onChange={(e) => setTfaDisableCode(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
}
