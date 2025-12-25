import apiClient from './client';
import { API_ENDPOINTS } from './config';

const pricesApi = {
  getPrices: async (deviceId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.DEVICES_PRODUCTS}/${deviceId}/products/${sessionId}`
      );

      if (response && response.data && response.data.rows) {
        return { success: true, data: response.data.rows };
      }

      return { success: false, error: 'Не удалось получить список товаров' };
    } catch (error) {
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
      
      if (response.success && response.data && response.data.categories) {
        return { success: true, data: response.data.categories };
      }

      return { success: false, error: response.error || 'Ошибка получения категорий' };
    } catch (error) {
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  getAvailableProducts: async (deviceId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.DEVICES_AVAILABLE_PRODUCTS}/${deviceId}/available-products/${sessionId}`
      );

      if (response && response.data && response.data.rows) {
        return { success: true, data: response.data.rows };
      }

      return { success: false, error: 'Не удалось получить список доступных товаров' };
    } catch (error) {
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  assignProducts: async (deviceId, products) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.DEVICES_ASSIGN_PRODUCTS}/${deviceId}/assign-products/${sessionId}`,
        { products }
      );

      if (response && response.data && response.data.OK) {
        return { success: true };
      }

      return { success: false, error: response?.data?.error || 'Ошибка при распределении товаров' };
    } catch (error) {
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  updateProductQuantity: async (deviceId, invoiceProductId, quantity) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.DEVICES_ASSIGN_PRODUCTS}/${deviceId}/assign-products/${sessionId}`,
        { 
          products: [
            {
              invoice_product_id: invoiceProductId,
              quantity: quantity
            }
          ]
        }
      );

      if (response && response.data && response.data.OK) {
        return { success: true };
      }

      return { success: false, error: response?.data?.error || 'Ошибка при обновлении количества' };
    } catch (error) {
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  uploadImage: async (file) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const formData = new FormData();
      
      if (file.uri && file.uri.startsWith('blob:')) {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const webFile = new File([blob], file.name, { type: file.type });
        formData.append('file', webFile);
      } else {
        formData.append('file', file);
      }

      const url = `https://alashcloud.kz${API_ENDPOINTS.UPLOAD_IMAGE}/${sessionId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (data.success) {
        return { success: true, url: data.url, public_id: data.public_id };
      }

      return { success: false, error: data.error || 'Ошибка загрузки изображения' };
    } catch (error) {
      return { success: false, error: error.message || 'Ошибка загрузки' };
    }
  },
};

export default pricesApi;
