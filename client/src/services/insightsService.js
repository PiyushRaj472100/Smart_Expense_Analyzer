import axios from "axios";

const API = "http://localhost:4000/insights";

const withMethod = (base, method) =>
  method && method !== "ALL" ? `${base}?method=${method}` : base;

export const getDailyInsights = (token, method = "ALL") =>
  axios.get(withMethod(`${API}/daily`, method), {
    headers: { Authorization: token },
  });

export const getMonthlyInsights = (token, method = "ALL") =>
  axios.get(withMethod(`${API}/monthly`, method), {
    headers: { Authorization: token },
  });

export const getYearlyInsights = (token, method = "ALL") =>
  axios.get(withMethod(`${API}/yearly`, method), {
    headers: { Authorization: token },
  });

export const getCategoryInsights = (token, method = "ALL") =>
  axios.get(withMethod(`${API}/category`, method), {
    headers: { Authorization: token },
  });

export const getInsightsSummary = (token) =>
  axios.get(`${API}/summary`, {
    headers: { Authorization: token },
  });
