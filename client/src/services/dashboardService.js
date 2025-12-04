import axios from "axios";

export const getDashboard = (token) => {
  return axios.get(`${import.meta.env.VITE_API_URL}/dashboard`, {
  headers: { Authorization: token }
});

};
