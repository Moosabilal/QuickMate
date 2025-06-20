import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  async register(name: string, email: string, password: string, role: string) {
    const response = await axios.post(`${API_URL}/register`, { name, email, password, role });
    return response.data;
  },
};