import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const checkEmailExists = async (email) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/check-email`, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check email' };
  }
};

export const verifyEmail = async (email, code) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { email, code });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Email verification failed' };
  }
};