// ─── SociaNova API Layer ────────────────────────────────────────────────────

const BASE_URL = "http://localhost:5000/api";

// Get JWT token
function getToken() {
  return localStorage.getItem("sn_token");
}

// Build request headers
function authHeaders(extra = {}) {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// Generic API request helper
async function request(method, path, body = null) {
  const options = {
    method,
    headers: authHeaders(),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Request failed (${response.status})`
    );
  }

  return data;
}

// ─── API Methods ────────────────────────────────────────────────────────────

const API = {
  // Auth
  register: (username, email, password) =>
    request("POST", "/users", {
      username,
      email,
      password,
    }),

  login: (email, password) =>
    request("POST", "/users/login", {
      email,
      password,
    }),

  getProfile: () =>
    request("GET", "/users/profile"),

  // Posts
  getPosts: () =>
    request("GET", "/posts"),

  getUserPosts: (id) =>
    request("GET", `/posts/user/${id}`),

  createPost: (content) =>
    request("POST", "/posts", {
      content,
    }),

  likePost: (id) =>
    request("PUT", `/posts/${id}/like`),

  commentPost: (id, text) =>
    request("POST", `/posts/${id}/comment`, {
      text,
    }),

  deletePost: (id) =>
    request("DELETE", `/posts/${id}`),

  editPost: (id, content) =>
    request("PUT", `/posts/${id}`, {
      content,
    }),

  // Users
  followUser: (id) =>
    request("PUT", `/users/${id}/follow`),

  searchUsers: (query) =>
    request("GET", `/users/search?q=${encodeURIComponent(query)}`),

  getUserProfile: (id) =>
    request("GET", `/users/${id}`),

};

// Make API globally available to auth.js and feed.js
window.API = API;