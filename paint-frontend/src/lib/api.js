const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Helper function to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper
const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Auth API
export const authApi = {
  register: (userData) =>
    fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getProfile: () => fetchApi("/auth/profile"),

  updateProfile: (profileData) =>
    fetchApi("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  forgotPassword: (email) =>
    fetchApi("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) =>
    fetchApi(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  googleAuth: (credential) =>
    fetchApi("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  changePassword: (currentPassword, newPassword) =>
    fetchApi("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Services API
export const servicesApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/services${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id) => fetchApi(`/services/${id}`),

  create: (serviceData) =>
    fetchApi("/services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    }),

  update: (id, serviceData) =>
    fetchApi(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    }),

  delete: (id) =>
    fetchApi(`/services/${id}`, {
      method: "DELETE",
    }),

  toggleStatus: (id) =>
    fetchApi(`/services/${id}/toggle-status`, {
      method: "PATCH",
    }),
};

// Portfolio/Projects API
export const portfolioApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/portfolio${queryString ? `?${queryString}` : ""}`);
  },

  getFeatured: () => fetchApi("/portfolio/featured/list"),

  getByRoom: (roomType) => fetchApi(`/portfolio/room/${roomType}`),

  getById: (id) => fetchApi(`/portfolio/${id}`),

  getStats: () => fetchApi("/portfolio/stats/overview"),

  create: (projectData) =>
    fetchApi("/portfolio", {
      method: "POST",
      body: JSON.stringify(projectData),
    }),

  update: (id, projectData) =>
    fetchApi(`/portfolio/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    }),

  delete: (id) =>
    fetchApi(`/portfolio/${id}`, {
      method: "DELETE",
    }),

  toggleFeatured: (id) =>
    fetchApi(`/portfolio/${id}/toggle-featured`, {
      method: "PATCH",
    }),
};

// Reviews API
export const reviewsApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/reviews${queryString ? `?${queryString}` : ""}`);
  },

  getStats: (serviceId) => {
    const params = serviceId ? `?service=${serviceId}` : "";
    return fetchApi(`/reviews/stats/overview${params}`);
  },

  getById: (id) => fetchApi(`/reviews/${id}`),

  create: (reviewData) =>
    fetchApi("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  update: (id, reviewData) =>
    fetchApi(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    }),

  delete: (id) =>
    fetchApi(`/reviews/${id}`, {
      method: "DELETE",
    }),

  toggleHelpful: (id) =>
    fetchApi(`/reviews/${id}/helpful`, {
      method: "PATCH",
    }),

  approve: (id) =>
    fetchApi(`/reviews/${id}/approve`, {
      method: "PATCH",
    }),

  reject: (id) =>
    fetchApi(`/reviews/${id}/reject`, {
      method: "PATCH",
    }),

  respond: (id, text) =>
    fetchApi(`/reviews/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};

// Quotes API
export const quotesApi = {
  create: (quoteData) =>
    fetchApi("/quotes", {
      method: "POST",
      body: JSON.stringify(quoteData),
    }),

  getMyQuotes: () => fetchApi("/quotes/my-quotes"),

  getById: (id) => fetchApi(`/quotes/${id}`),

  accept: (id) =>
    fetchApi(`/quotes/${id}/accept`, {
      method: "PATCH",
    }),

  reject: (id, reason) =>
    fetchApi(`/quotes/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  // Admin endpoints
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/quotes/admin/all${queryString ? `?${queryString}` : ""}`);
  },

  getStats: () => fetchApi("/quotes/stats/overview"),

  updateStatus: (id, status, note) =>
    fetchApi(`/quotes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }),

  updatePrice: (id, priceData) =>
    fetchApi(`/quotes/${id}/price`, {
      method: "PUT",
      body: JSON.stringify(priceData),
    }),

  send: (id, sendData) =>
    fetchApi(`/quotes/${id}/send`, {
      method: "POST",
      body: JSON.stringify(sendData),
    }),

  recalculate: (id, params) =>
    fetchApi(`/quotes/${id}/recalculate`, {
      method: "POST",
      body: JSON.stringify(params),
    }),

  delete: (id) =>
    fetchApi(`/quotes/${id}`, {
      method: "DELETE",
    }),
};

// Upload API
export const uploadApi = {
  single: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  multiple: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  project: async (beforeImage, afterImage, additionalImages) => {
    const formData = new FormData();
    if (beforeImage) formData.append("beforeImage", beforeImage);
    if (afterImage) formData.append("afterImage", afterImage);
    additionalImages?.forEach((file) =>
      formData.append("additionalImages", file)
    );

    const response = await fetch(`${API_BASE_URL}/upload/project`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  reviewMedia: async (photos, videos) => {
    const formData = new FormData();
    photos?.forEach((file) => formData.append("photos", file));
    videos?.forEach((file) => formData.append("videos", file));

    const response = await fetch(`${API_BASE_URL}/upload/review-media`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  delete: (publicId) =>
    fetchApi(`/upload/${publicId}`, {
      method: "DELETE",
    }),
};

// Contact API
export const contactApi = {
  submit: (contactData) =>
    fetchApi("/contact", {
      method: "POST",
      body: JSON.stringify(contactData),
    }),

  // Admin endpoints
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/contact/admin/all${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id) => fetchApi(`/contact/admin/${id}`),

  updateStatus: (id, data) =>
    fetchApi(`/contact/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  reply: (id, replyMessage) =>
    fetchApi(`/contact/admin/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ replyMessage }),
    }),

  delete: (id) =>
    fetchApi(`/contact/admin/${id}`, {
      method: "DELETE",
    }),
};

// AI Room Visualizer API
export const aiApi = {
  // Generate room visualization
  visualize: (prompt, imageBase64 = null) =>
    fetchApi("/ai/visualize", {
      method: "POST",
      body: JSON.stringify({ prompt, imageBase64 }),
    }),

  // Get color suggestions
  getColorSuggestions: (roomType, mood) => {
    const params = new URLSearchParams({ roomType, mood }).toString();
    return fetchApi(`/ai/colors?${params}`);
  },

  // Save design to profile (requires auth)
  saveDesign: (imageBase64, prompt, roomType) =>
    fetchApi("/ai/designs/save", {
      method: "POST",
      body: JSON.stringify({ imageBase64, prompt, roomType }),
    }),

  // Get saved designs (requires auth)
  getSavedDesigns: () => fetchApi("/ai/designs"),
};
