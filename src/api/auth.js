import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const authApi = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.LOGIN,
        {
          login: username,
          password: password,
        }
      );

      if (response.success && response.data?.success) {
        const sessionId = response.data.session_id;
        apiClient.setSessionId(sessionId);
        
        return {
          success: true,
          authenticated: true,
          sessionId: sessionId,
          user: response.data.user,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка авторизации',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LOGOUT);
      
      apiClient.clearSessionId();
      
      console.log('Выход выполнен успешно');

      return response;
    } catch (error) {
      console.error('Logout error:', error);
      apiClient.clearSessionId();
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
