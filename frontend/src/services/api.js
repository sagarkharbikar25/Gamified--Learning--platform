import axios from "axios";

const API = axios.create({
baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("eduquest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("eduquest_token");
      localStorage.removeItem("eduquest_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ────────────────────────────────────────
export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  changePassword: (data) => API.put("/auth/password", data),
};

// ─── ACTIVITIES ──────────────────────────────────
export const activityAPI = {
  getAll: (params) => API.get("/activities", { params }),
  getOne: (id) => API.get(`/activities/${id}`),
  create: (data) => API.post("/activities", data),
  update: (id, data) => API.put(`/activities/${id}`, data),
  delete: (id) => API.delete(`/activities/${id}`),
  submit: (id, data) => API.post(`/activities/${id}/submit`, data),
  getSubmissions: (id) => API.get(`/activities/${id}/submissions`),
  verifySubmission: (submissionId, data) =>
    API.put(`/activities/submissions/${submissionId}/verify`, data),
};

// ─── UPLOAD ──────────────────────────────────────
export const uploadAPI = {
  uploadFile: (submissionId, formData, onProgress) =>
    API.post(`/uploads/submission/${submissionId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) =>
        onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  deleteFile: (publicId) =>
    API.delete(`/uploads/file/${encodeURIComponent(publicId)}`),
};

// ─── AI ──────────────────────────────────────────
export const aiAPI = {
  generateActivity: (data) => API.post("/ai/generate-activity", data),
  analyzeSubmission: (submissionId) =>
    API.post(`/ai/feedback/${submissionId}`),
  generateQuizQuestions: (data) => API.post("/ai/quiz-questions", data),
  generateStudyPlan: (data) => API.post("/ai/study-plan", data),
  getInsights: (studentId) => API.get(`/ai/insights/${studentId}`),
  // Tutor uses SSE streaming — handled separately in useAITutor hook
};

// ─── STUDENTS ────────────────────────────────────
export const studentAPI = {
  getAll: (params) => API.get("/students", { params }),
  getOne: (id) => API.get(`/students/${id}`),
};

// ─── TEACHERS ────────────────────────────────────
export const teacherAPI = {
  getAll: () => API.get("/teachers"),
  getOne: (id) => API.get(`/teachers/${id}`),
};

// ─── SCHOOL ──────────────────────────────────────
export const schoolAPI = {
  getStats: () => API.get("/school/stats"),
};

// ─── LEADERBOARD ─────────────────────────────────
export const leaderboardAPI = {
  get: (params) => API.get("/leaderboard", { params }),
  getGames: (params) => API.get("/leaderboard/games", { params }),
};

// ─── GAMES ───────────────────────────────────────
export const gameAPI = {
  saveSession: (data) => API.post("/games/session", data),
  getMySessions: () => API.get("/games/sessions"),
  getStats: () => API.get("/games/stats"),
};

export default API;