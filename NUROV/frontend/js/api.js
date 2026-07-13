/* ==========================================================================
   API client — thin wrapper around fetch() for the backend REST API.
   Change API_BASE if your backend runs on a different host/port.
   ========================================================================== */

const API_BASE = 'http://localhost:5000/api';

const Auth = {
  getToken(){ return localStorage.getItem('bcp_token'); },
  getUser(){ const raw = localStorage.getItem('bcp_user'); return raw ? JSON.parse(raw) : null; },
  setSession(token, user){
    localStorage.setItem('bcp_token', token);
    localStorage.setItem('bcp_user', JSON.stringify(user));
  },
  clear(){ localStorage.removeItem('bcp_token'); localStorage.removeItem('bcp_user'); },
  isLoggedIn(){ return !!this.getToken(); },
  isAdmin(){ const u = this.getUser(); return u && u.role === 'admin'; },
  requireLogin(){
    if (!this.isLoggedIn()){ window.location.href = 'login.html'; return false; }
    return true;
  },
  requireAdmin(){
    if (!this.requireLogin()) return false;
    if (!this.isAdmin()){ window.location.href = 'products.html'; return false; }
    return true;
  }
};

async function apiRequest(path, { method = 'GET', body, auth = true } = {}){
  const headers = { 'Content-Type': 'application/json' };
  if (auth && Auth.getToken()) headers['Authorization'] = `Bearer ${Auth.getToken()}`;

  let res;
  try{
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  }catch(err){
    throw new Error('Пайваст ба сервер имконнопазир аст. Мутмаин шавед, ки backend кор мекунад.');
  }

  let data = {};
  try{ data = await res.json(); }catch(e){ /* empty body */ }

  if (!res.ok){
    if (res.status === 401 && auth){ Auth.clear(); }
    throw new Error(data.message || `Хатогии сервер (${res.status})`);
  }
  return data;
}

const Api = {
  // Auth
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => apiRequest('/auth/me'),

  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== '' && v != null)).toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },
  getCategories: () => apiRequest('/products/categories', { auth: false }),
  getProduct: (id) => apiRequest(`/products/${id}`, { auth: false }),
  addReview: (id, payload) => apiRequest(`/products/${id}/reviews`, { method: 'POST', body: payload }),
  createProduct: (payload) => apiRequest('/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => apiRequest(`/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => apiRequest('/cart'),
  addToCart: (product_id, quantity = 1) => apiRequest('/cart', { method: 'POST', body: { product_id, quantity } }),
  updateCartItem: (cartItemId, quantity) => apiRequest(`/cart/${cartItemId}`, { method: 'PUT', body: { quantity } }),
  removeCartItem: (cartItemId) => apiRequest(`/cart/${cartItemId}`, { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => apiRequest('/wishlist'),
  addWishlist: (product_id) => apiRequest('/wishlist', { method: 'POST', body: { product_id } }),
  removeWishlist: (productId) => apiRequest(`/wishlist/${productId}`, { method: 'DELETE' }),

  // Orders
  checkout: (payload) => apiRequest('/orders', { method: 'POST', body: payload }),
  getMyOrders: () => apiRequest('/orders'),
  getAllOrders: (status) => apiRequest(`/orders/admin/all${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (id, status) => apiRequest(`/orders/admin/${id}/status`, { method: 'PUT', body: { status } }),

  // Profile
  updateProfile: (payload) => apiRequest('/users/profile', { method: 'PUT', body: payload }),
  changePassword: (payload) => apiRequest('/users/password', { method: 'PUT', body: payload }),

  // Admin
  getDashboard: () => apiRequest('/admin/dashboard'),
  getUsers: () => apiRequest('/admin/users'),
  updateUserRole: (id, role) => apiRequest(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  createCategory: (payload) => apiRequest('/admin/categories', { method: 'POST', body: payload }),
  deleteCategory: (id) => apiRequest(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => apiRequest('/settings', { auth: false }),
  updateSettings: (payload) => apiRequest('/settings', { method: 'PUT', body: payload })
};
