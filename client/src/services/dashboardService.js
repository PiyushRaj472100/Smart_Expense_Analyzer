import axios from "axios";

export const getDashboard = (token) => {
  return axios.get("http://localhost:4000/dashboard", {
    headers: {
      Authorization: token,
    },
  });
};
