import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const authApi = {
  login: async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await apiClient.post(
        API_ENDPOINTS.LOGIN,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.success && response.status === 200) {
        console.log('Авторизация успешна, сессия установлена');
        return {
          success: true,
          authenticated: true,
        };
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LOGOUT);

    //   console.log('Выход выполнен успешно');

      return response;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  isAuthenticated: () => {
    return false;
  },

  getToken: () => {
    return null;
  },
};
