import { apiRequest } from './client.js';

export const authApi = {
  /**
   * Log in with email and password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, token?: string, admin?: object, tfaRequired?: boolean, tempToken?: string }>}
   */
  async login(credentials) {
    return apiRequest('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Google OAuth login
   * @param {{ idToken: string }} data
   */
  async googleLogin(data) {
    return apiRequest('/admin/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify TOTP code during 2FA login challenge
   * @param {{ tempToken: string, code: string }} data
   */
  async verifyTfa(data) {
    return apiRequest('/admin/auth/tfa/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Request TFA setup (returns QR code data URL and base32 secret)
   */
  async setupTfa() {
    return apiRequest('/admin/auth/tfa/setup', {
      method: 'POST',
    });
  },

  /**
   * Confirm and activate TFA with 6-digit code
   * @param {{ code: string }} data
   */
  async enableTfa(data) {
    return apiRequest('/admin/auth/tfa/enable', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Disable TFA with current 6-digit code
   * @param {{ code: string }} data
   */
  async disableTfa(data) {
    return apiRequest('/admin/auth/tfa/disable', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
