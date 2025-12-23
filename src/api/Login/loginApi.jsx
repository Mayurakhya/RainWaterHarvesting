import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL ;

export const loginUser = async (credentials) => {
  try {
    
    const params = new URLSearchParams();
    params.append('username', credentials.email); 
    params.append('password', credentials.password);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};
