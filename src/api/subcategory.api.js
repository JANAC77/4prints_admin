import { apiRequest, apiMultipartRequest } from './client.js';

export const subcategoryApi = {
  /**
   * List subcategories for a given category
   * @param {{ categoryId: string, isActive?: string }} params
   */
  async list(params) {
    const query = new URLSearchParams();
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.isActive !== undefined && params.isActive !== '') {
      query.set('isActive', String(params.isActive));
    }

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/subcategories${qs}`);
  },

  /**
   * Get single subcategory by ID
   * @param {string} id
   */
  async getById(id) {
    return apiRequest(`/admin/subcategories/${id}`);
  },

  /**
   * Create a new subcategory with multipart/form-data
   * @param {{ categoryId: string, name: string, description?: string, isActive?: boolean, imageFile?: File }} data
   */
  async create(data) {
    const formData = new FormData();
    formData.append('categoryId', data.categoryId);
    formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    return apiMultipartRequest('/admin/subcategories', formData, { method: 'POST' });
  },

  /**
   * Update subcategory by ID
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

    return apiMultipartRequest(`/admin/subcategories/${id}`, formData, { method: 'PUT' });
  },

  /**
   * Delete subcategory by ID
   * @param {string} id
   */
  async delete(id) {
    return apiRequest(`/admin/subcategories/${id}`, {
      method: 'DELETE',
    });
  },
};
