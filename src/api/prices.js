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
        `${API_ENDPOINTS.PRICES_LIST}/${deviceId}/${sessionId}`
      );

      if (response && response.data && response.data.rows) {
        const rowsString = response.data.rows;
        const prices = JSON.parse(rowsString);
        return { success: true, data: prices };
      }

      return { success: false, error: 'Не удалось получить список тарифов' };
    } catch (error) {
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES_LIST);
      
      if (response.success && response.data && response.data.categories) {
        return { success: true, data: response.data.categories };
      }

      return { success: false, error: response.error || 'Ошибка получения категорий' };
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

  create: async (priceData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const payload = {
        device_id: parseInt(priceData.device_id),
        name: priceData.name,
        amount: parseFloat(priceData.amount),
        name2: priceData.name2 || priceData.name,
        url: priceData.url || null,
        category: priceData.category || null
      };

      const response = await apiClient.post(
        `${API_ENDPOINTS.PRICES_CREATE}/${sessionId}`,
        payload
      );

      if (response.OK || response.success) {
        return { success: true, OK: true, id: response.id };
      }

      return { success: false, error: response.error || 'Ошибка создания тарифа' };
    } catch (error) {
      console.error('[prices.create] Исключение:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  update: async (priceData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const payload = {
        device_id: parseInt(priceData.device_id),
        price_id: parseInt(priceData.price_id),
        name: priceData.name,
        amount: parseFloat(priceData.amount),
        name2: priceData.name2 || priceData.name,
        url: priceData.url || null,
        category: priceData.category || null
      };

      const response = await apiClient.post(
        `${API_ENDPOINTS.PRICES_UPDATE}/${sessionId}`,
        payload
      );

      if (response.OK || response.success) {
        return { success: true, OK: true };
      }

      return { success: false, error: response.error || 'Ошибка обновления тарифа' };
    } catch (error) {
      console.error('Update price error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  delete: async (deviceId, priceId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.PRICES_DELETE}/${deviceId}/${priceId}/${sessionId}`,
        {}
      );

      if (response.OK || response.success) {
        return { success: true, OK: true };
      }

      return { success: false, error: response.error || 'Ошибка удаления тарифа' };
    } catch (error) {
      console.error('Delete price error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  }
};

export default pricesApi;
