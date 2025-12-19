import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const accountsApi = {
  getAccounts: async (userId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return {
          success: false,
          error: 'Сессия не найдена',
        };
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.ACCOUNTS_GET}/${userId}/${sessionId}`
      );

      if (response.success && response.data?.rows) {
        return {
          success: true,
          data: response.data.rows,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка получения счетов',
      };
    } catch (error) {
      console.error('Get accounts error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  create: async (accountData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return {
          success: false,
          error: 'Сессия не найдена',
        };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.ACCOUNTS_CREATE}/${sessionId}`,
        accountData
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
          id: response.data.id,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка создания счета',
      };
    } catch (error) {
      console.error('Account create error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  update: async (accountData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return {
          success: false,
          error: 'Сессия не найдена',
        };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.ACCOUNTS_EDIT}/${sessionId}`,
        accountData
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
          id: response.data.id,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка редактирования счета',
      };
    } catch (error) {
      console.error('Account update error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  delete: async (accountId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return {
          success: false,
          error: 'Сессия не найдена',
        };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.ACCOUNTS_DELETE}/${accountId}/${sessionId}`,
        {}
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка удаления счета',
      };
    } catch (error) {
      console.error('Account delete error:', error);
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },
};
