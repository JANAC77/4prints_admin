import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthToken, setAuthToken } from '../api/client.js';
import { authApi } from '../api/auth.api.js';
import { adminApi } from '../api/admin.api.js';
import { mockAdmin } from '../utils/mockData.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setTokenState] = useState(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [tfaChallenge, setTfaChallenge] = useState(null); // { tempToken }

  const toast = useToast();

  const logout = useCallback(() => {
    setAuthToken(null);
    setTokenState(null);
    setAdmin(null);
    setTfaChallenge(null);
    setIsDemoMode(false);
  }, []);

  // Fetch admin profile
  const refreshProfile = useCallback(async () => {
    if (isDemoMode) {
      setAdmin(mockAdmin);
      return;
    }

    const currentToken = getAuthToken();
    if (!currentToken) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await adminApi.getProfile();
      if (res.success && res.admin) {
        setAdmin(res.admin);
      }
    } catch (err) {
      console.warn('Could not fetch admin profile:', err.message);
      // If unauthorized, clear
      if (err.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, logout]);

  useEffect(() => {
    refreshProfile();

    const handleUnauthorized = () => {
      if (!isDemoMode) {
        toast.warning('Session expired. Please log in again.');
        logout();
      }
    };

    window.addEventListener('admin:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('admin:unauthorized', handleUnauthorized);
    };
  }, [refreshProfile, isDemoMode, logout, toast]);

  /**
   * Log in with email & password
   */
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });

      if (res.tfaRequired) {
        setTfaChallenge({ tempToken: res.tempToken });
        setIsLoading(false);
        return { tfaRequired: true };
      }

      if (res.success && res.token) {
        setAuthToken(res.token);
        setTokenState(res.token);
        setAdmin(res.admin);
        setTfaChallenge(null);
        toast.success(`Welcome back, ${res.admin?.name || 'Admin'}!`);
        setIsLoading(false);
        return { success: true };
      }

      throw new Error(res.error?.message || 'Login failed');
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Complete TFA login
   */
  const verifyTfaLogin = async (code) => {
    if (!tfaChallenge?.tempToken) {
      throw new Error('No active 2FA challenge');
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyTfa({
        tempToken: tfaChallenge.tempToken,
        code,
      });

      if (res.success && res.token) {
        setAuthToken(res.token);
        setTokenState(res.token);
        setAdmin(res.admin);
        setTfaChallenge(null);
        toast.success(`2FA verified! Welcome, ${res.admin?.name || 'Admin'}`);
        setIsLoading(false);
        return { success: true };
      }

      throw new Error(res.error?.message || 'TFA verification failed');
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Quick demo login for testing without running backend
   */
  const loginDemo = () => {
    setIsDemoMode(true);
    setAdmin(mockAdmin);
    setTokenState('demo_token_mock_12345');
    setTfaChallenge(null);
    toast.info('Entered Offline Demo Mode. All dashboard features are active.');
  };

  const cancelTfaChallenge = () => {
    setTfaChallenge(null);
  };

  const updateAdminProfileState = (updatedFields) => {
    setAdmin((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  const value = {
    admin,
    token,
    isAuthenticated: Boolean(admin || token || isDemoMode),
    isLoading,
    isDemoMode,
    tfaChallenge,
    login,
    verifyTfaLogin,
    loginDemo,
    cancelTfaChallenge,
    logout,
    refreshProfile,
    updateAdminProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
