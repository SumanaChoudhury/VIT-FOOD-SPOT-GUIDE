/**
 * VIT Food Spot Guide — Client API Service
 * Encapsulates all AJAX / REST communication with the Express backend
 */

function cleanParams(params) {
  if (!params || typeof params !== 'object') return {};
  const cleaned = {};
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null' && val !== 'all') {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

function getResolvedApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:5000/api';
    }
    if (window.location.port && window.location.port !== '5000' && window.location.port !== '') {
      return 'http://localhost:5000/api';
    }
  }
  return '/api';
}

const API = {
  baseUrl: getResolvedApiBaseUrl(),

  async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Accept': 'application/json'
    };

    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Attach stored admin token for robust cross-origin / file:// authentication
    const adminToken = (typeof localStorage !== 'undefined') ? localStorage.getItem('vit_admin_token') : null;
    if (adminToken) {
      defaultHeaders['x-admin-token'] = adminToken;
      defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      credentials: 'include'
    };

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, config);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || json.errors?.join(', ') || `Request failed with status ${res.status}`);
      }
      return json;
    } catch (err) {
      console.warn(`[API Notice: ${endpoint}]`, err.message);
      throw err;
    }
  },

  // Food Spots
  getFoodSpots(params = {}) {
    const cleaned = cleanParams(params);
    const q = new URLSearchParams(cleaned).toString();
    return this.request(`/food-spots${q ? `?${q}` : ''}`);
  },

  getFoodSpot(id) {
    return this.request(`/food-spots/${encodeURIComponent(id)}`);
  },

  getFoodSpotById(id) {
    return this.getFoodSpot(id);
  },

  getNearbyFoodSpots(params = {}) {
    const cleaned = cleanParams(params);
    const q = new URLSearchParams(cleaned).toString();
    return this.request(`/food-spots/nearby${q ? `?${q}` : ''}`);
  },

  getCounters(spotId) {
    return this.request(`/food-spots/${encodeURIComponent(spotId)}/counters`);
  },

  // Locations
  getLocations() {
    return this.request('/locations');
  },

  getLocationBySlug(slug) {
    return this.request(`/locations/${encodeURIComponent(slug)}`);
  },

  // Dishes & Menus
  getMenuItems(params = {}) {
    const cleaned = cleanParams(params);
    const q = new URLSearchParams(cleaned).toString();
    return this.request(`/menu-items${q ? `?${q}` : ''}`);
  },

  searchDishes(query, filters = {}) {
    const p = cleanParams({ q: query, ...filters });
    const q = new URLSearchParams(p).toString();
    return this.request(`/menu-items/search?${q}`);
  },

  getCategories() {
    return this.request('/menu-items/categories');
  },

  // Student Authentication
  authRegister(email, password, name) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  },

  authLogin(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  authGetMe() {
    return this.request('/auth/me');
  },

  authLogout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  },

  // Student Feedback & Ratings
  getFeedback(foodSpotId = '') {
    const q = foodSpotId ? `?foodSpotId=${encodeURIComponent(foodSpotId)}` : '';
    return this.request(`/feedback${q}`);
  },

  submitFeedback(data) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getStudentFavourites() {
    return this.request('/feedback/student-favourites');
  },

  // Student Favorites
  getFavorites() {
    return this.request('/favorites');
  },

  addFavorite(foodSpotId, menuItemId = null) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ foodSpotId, menuItemId })
    });
  },

  removeFavorite(id) {
    return this.request(`/favorites/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Recommendations Compatibility
  getRecommendations(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/recommendations${q ? `?${q}` : ''}`);
  },

  submitRecommendation(data) {
    return this.request('/recommendations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // AI Chat
  sendChatMessage(message) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // Admin
  async adminLogin(username, password) {
    const res = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res && res.token && typeof localStorage !== 'undefined') {
      localStorage.setItem('vit_admin_token', res.token);
    }
    return res;
  },

  async adminLogout() {
    try {
      await this.request('/admin/logout', {
        method: 'POST'
      });
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('vit_admin_token');
      }
    }
  },

  checkAdminSession() {
    return this.request('/admin/session');
  },

  getDataQualityMetrics() {
    return this.request('/admin/data-quality');
  },

  // Food Spots (Restaurants) Admin CRUD
  getAdminFoodSpots() {
    return this.request('/admin/food-spots');
  },

  addAdminFoodSpot(data) {
    return this.request('/admin/food-spots', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateAdminFoodSpot(id, data) {
    return this.request(`/admin/food-spots/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteAdminFoodSpot(id) {
    return this.request(`/admin/food-spots/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Menu Items Admin CRUD
  getAdminMenuItems(params = {}) {
    const q = new URLSearchParams(cleanParams(params)).toString();
    return this.request(`/admin/menu-items${q ? `?${q}` : ''}`);
  },

  addAdminMenuItem(data) {
    return this.request('/admin/menu-items', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateAdminMenuItem(id, data) {
    return this.request(`/admin/menu-items/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteAdminMenuItem(id) {
    return this.request(`/admin/menu-items/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  getAllRecommendations(status = '') {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/admin/recommendations${q}`);
  },

  updateRecommendationStatus(id, status) {
    return this.request(`/admin/recommendations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  importDatasetFile(formData) {
    return this.request('/admin/import', {
      method: 'POST',
      body: formData
    });
  }
};
