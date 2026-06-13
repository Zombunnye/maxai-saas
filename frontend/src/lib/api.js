import axios from "axios";

// ─── WHY: Централизиран axios instance означава:
// 1. JWT token-ът се добавя автоматично на ВСЯКА заявка
// 2. Base URL е на едно място — сменяш го веднъж при deploy
// 3. 401 responses автоматично logout-ват потребителя

const api = axios.create({
  baseURL: "https://maxai-saas-production.up.railway.app/api",
});

// Преди всяка заявка — вземаме token от localStorage и го слагаме в header-а
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("maxai_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ако сървърът върне 401 (изтекъл/невалиден token) — logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("maxai_token");
      localStorage.removeItem("maxai_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
