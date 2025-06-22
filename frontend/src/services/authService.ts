import axios from 'axios';
import config from '../API/config';

const API_URL = `${config.API_BASE_URL}/auth`;

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