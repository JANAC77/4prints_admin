import { apiRequest, apiMultipartRequest } from './client.js';

export const categoryApi = {
  /**
   * List categories with optional pagination and filters
   * @param {{ page?: number, limit?: number, search?: string, isActive?: string }} params
   */
  async list(params = {}) {
    const query = new URLSearchParams();
    if (params.isActive === 'true' || params.isActive === true) {
      query.set('isActive', 'true');
    } else if (params.isActive === 'false' || params.isActive === false) {
      query.set('isActive', 'false');
    }

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/categories${qs}`);
  },

  /**
   * Get single category by ID
   * @param {string} id
   */
  async getById(id) {
    return apiRequest(`/admin/categories/${id}`);
  },

  /**
   * Create a new category with multipart/form-data
   * @param {{ name: string, description?: string, isActive?: boolean, imageFile?: File }} data
   */
  async create(data) {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    return apiMultipartRequest('/admin/categories', formData, { method: 'POST' });
  },

  /**
   * Update category by ID with multipart/form-data
   * @param {string} id
   * @param {{ name?: string, description?: string, isActive?: boolean, imageFile?: File }} data
   */
  async update(id, data) {
    const formData = new FormData();
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    return apiMultipartRequest(`/admin/categories/${id}`, formData, { method: 'PUT' });
  },

  /**
   * Delete category by ID
   * @param {string} id
   */
  async delete(id) {
    return apiRequest(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
