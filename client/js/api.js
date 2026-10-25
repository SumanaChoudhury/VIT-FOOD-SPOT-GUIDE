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

    const isCrossOrigin = this.baseUrl.startsWith('http');
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      credentials: isCrossOrigin ? 'include' : 'same-origin'
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
  adminLogin(username, password) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  adminLogout() {
    return this.request('/admin/logout', {
      method: 'POST'
    });
  },

  checkAdminSession() {
    return this.request('/admin/session');
  },

  getDataQualityMetrics() {
    return this.request('/admin/data-quality');
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
