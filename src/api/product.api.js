import { apiRequest } from './client.js';

export const productApi = {
  /**
   * List products with pagination, search, category, and status filters
   * @param {{
   *   page?: number,
   *   limit?: number,
   *   category?: string,
   *   subCategory?: string,
   *   active?: boolean | string,
   *   featured?: boolean | string,
   *   bestSeller?: boolean | string,
   *   newArrival?: boolean | string,
   *   search?: string,
   *   tags?: string
   * }} params
   */
  async list(params = {}) {
    const query = new URLSearchParams();

    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.category) query.set('category', params.category);
    if (params.subCategory) query.set('subCategory', params.subCategory);

    if (params.active !== undefined && params.active !== null && params.active !== '') {
      query.set('active', String(params.active));
    }
    if (params.featured !== undefined && params.featured !== null && params.featured !== '') {
      query.set('featured', String(params.featured));
    }
    if (params.bestSeller !== undefined && params.bestSeller !== null && params.bestSeller !== '') {
      query.set('bestSeller', String(params.bestSeller));
    }
    if (params.newArrival !== undefined && params.newArrival !== null && params.newArrival !== '') {
      query.set('newArrival', String(params.newArrival));
    }

    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.tags?.trim()) query.set('tags', params.tags.trim());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/products${qs}`);
  },

  /**
   * Get single product by ID
   * @param {string} id
   */
  async getById(id) {
    return apiRequest(`/admin/products/${id}`);
  },

  /**
   * Create a new product (JSON body)
   * @param {Object} data
   */
  async create(data) {
    return apiRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update product by ID (JSON body)
   * @param {string} id
   * @param {Object} data
   */
  async update(id, data) {
    return apiRequest(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Quick status flag toggle
   * @param {string} id
   * @param {{ active?: boolean, featured?: boolean, bestSeller?: boolean, newArrival?: boolean }} statusFlags
   */
  async updateStatus(id, statusFlags) {
    return apiRequest(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusFlags),
    });
  },

  /**
   * Delete product by ID
   * @param {string} id
   */
  async delete(id) {
    return apiRequest(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },
};
