import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 180000  // 3 minutes — needed for local Mistral LLM responses
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("iqac_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getActionPriorityQueue = (params) => client.get("/analytics/action-priority", { params });
export const getActionPriorityOverview = () => client.get("/analytics/action-priority/overview");
export const runWhatIfSimulation = (payload) => client.post("/analytics/what-if-simulation", payload);

export default client;
