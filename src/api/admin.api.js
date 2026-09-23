import { apiRequest } from './client.js';

export const adminApi = {
  /**
   * Get current authenticated admin profile
   */
  async getProfile() {
    return apiRequest('/admin/manage/profile');
  },

  /**
   * Get list of all administrators
   */
  async listAdmins() {
    return apiRequest('/admin/manage/list');
  },

  /**
   * Create a new administrator account
   * @param {{ name: string, email: string, password?: string, role: string }} data
   */
  async createAdmin(data) {
    return apiRequest('/admin/manage/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an administrator account by ID
   * @param {string} id
   */
  async deleteAdmin(id) {
    return apiRequest(`/admin/manage/${id}`, {
      method: 'DELETE',
    });
  },
};
