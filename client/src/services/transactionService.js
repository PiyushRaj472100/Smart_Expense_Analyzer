import axios from "axios";

const BASE = "http://localhost:4000/transactions";

export const getTransactions = (token) =>
  axios.get(BASE, {
    headers: { Authorization: token },
  });

export const createTransaction = (token, data) =>
  axios.post(BASE, data, {
    headers: { Authorization: token },
  });
