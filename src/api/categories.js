import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const categoriesApi = {
  getList: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);

      if (response.success && response.data?.categories) {
        return {
          success: true,
          data: response.data.categories,
        };
      }

      return {
        success: false,
        error: 'Ошибка получения категорий',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },
};

export default categoriesApi;
