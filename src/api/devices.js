import apiClient from './client';
import { API_ENDPOINTS } from './config';

const devicesApi = {
  getDevices: async (accountId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.DEVICES_LIST}/${accountId}/${sessionId}`,
        { order: null, offset: 0, limit: 1000, search: null }
      );

      if (response.success) {
        return { success: true, data: response.data };
      }

      return { success: false, error: response.data?.error || 'Ошибка получения устройств' };
    } catch (error) {
      console.error('Get devices error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  getMachid: async () => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.DEVICES_MACHID_GENERATE}/${sessionId}`
      );

      if (response.machid) {
        return { success: true, machid: response.machid };
      }

      if (response.success && response.data?.machid) {
        return { success: true, machid: response.data.machid };
      }

      return { success: false, error: response.error || 'Ошибка генерации machid' };
    } catch (error) {
      console.error('Get machid error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  create: async (deviceData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.DEVICES_CREATE}/${sessionId}`,
        deviceData
      );

      if (response.OK || response.success) {
        return { success: true, OK: true, id: response.id };
      }

      return { success: false, error: response.error || 'Ошибка создания устройства' };
    } catch (error) {
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  update: async (deviceData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.DEVICES_UPDATE}/${sessionId}`,
        deviceData
      );

      if (response.OK || response.success) {
        return { success: true, OK: true };
      }

      return { success: false, error: response.error || 'Ошибка обновления устройства' };
    } catch (error) {
      console.error('Update device error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  },

  delete: async (deviceId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.DEVICES_DELETE}/${deviceId}/${sessionId}`,
        {}
      );

      if (response.OK || response.success) {
        return { success: true, OK: true };
      }

      return { success: false, error: response.error || 'Ошибка удаления устройства' };
    } catch (error) {
      console.error('Delete device error:', error);
      return { success: false, error: error.error || 'Ошибка сети' };
    }
  }
};

export default devicesApi;
