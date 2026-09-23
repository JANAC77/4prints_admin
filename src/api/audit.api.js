import { apiRequest } from './client.js';

export const auditApi = {
  /**
   * List audit logs with pagination and filters
   * @param {{ page?: number, limit?: number, action?: string, adminId?: string }} params
   */
  async list(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.action) query.set('action', params.action);
    if (params.adminId) query.set('adminId', params.adminId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/audit-logs${qs}`);
  },
};
