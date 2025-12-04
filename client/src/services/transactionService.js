import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL}/transactions`;


export const getTransactions = (token) =>
  axios.get(BASE, {
    headers: { Authorization: token },
  });

export const createTransaction = (token, data) =>
  axios.post(BASE, data, {
    headers: { Authorization: token },
  });
