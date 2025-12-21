import apiClient from './client';
import { API_ENDPOINTS } from './config';

const categoriesApi = {
  getCategories: async () => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.CATEGORIES_LIST}/${sessionId}`,
        {}
      );

      if (response.success) {
        return { success: true, data: response.data };
      }

      return { success: false, error: response.data?.error || 'Ошибка получения категорий' };
    } catch (error) {
      console.error('Get categories error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  create: async (categoryData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.CATEGORIES_CREATE}/${sessionId}`,
        categoryData
      );

      if (response.OK || response.success) {
        return { success: true, OK: true, id: response.id };
      }

      return { success: false, error: response.error || 'Ошибка создания категории' };
    } catch (error) {
      console.error('Create category error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  update: async (categoryData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.CATEGORIES_UPDATE}/${sessionId}`,
        categoryData
      );

      if (response.OK || response.success) {
        return { success: true, OK: true };
      }

      return { success: false, error: response.error || 'Ошибка обновления категории' };
    } catch (error) {
      console.error('Update category error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  delete: async (categoryId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.CATEGORIES_DELETE}/${sessionId}`,
        { id: categoryId }
      );

      if (response.OK || response.success) {
        return { success: true, OK: true };
      }

      return { success: false, error: response.error || 'Ошибка удаления категории' };
    } catch (error) {
      console.error('Delete category error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  }
};

export default categoriesApi;
