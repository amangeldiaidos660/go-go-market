import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const usersApi = {
  getList: async (params = {}) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return {
          success: false,
          error: 'Сессия не найдена',
        };
      }

      const requestData = {
        order: params.order || null,
        offset: params.offset || 0,
        limit: params.limit || 100,
        search: params.search || null,
      };

      const response = await apiClient.post(
        `${API_ENDPOINTS.USERS_LIST}/${sessionId}`,
        requestData
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка получения списка пользователей',
      };
    } catch (error) {
      console.error('Users list error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  create: async (userData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return {
          success: false,
          error: 'Сессия не найдена',
        };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.USERS_CREATE}/${sessionId}`,
        userData
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
          id: response.data.id,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка создания пользователя',
      };
    } catch (error) {
      console.error('User create error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  update: async (userId, userData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return {
          success: false,
          error: 'Сессия не найдена',
        };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.USERS_EDIT}/${sessionId}`,
        {
          ...userData,
          id: userId,
        }
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
          id: response.data.id,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка редактирования пользователя',
      };
    } catch (error) {
      console.error('User update error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  delete: async (userId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return {
          success: false,
          error: 'Сессия не найдена',
        };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.USERS_DELETE}/${userId}/${sessionId}`,
        {}
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка удаления пользователя',
      };
    } catch (error) {
      console.error('User delete error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },
};
