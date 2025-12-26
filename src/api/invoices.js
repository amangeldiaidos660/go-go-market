import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const invoicesApi = {
  getList: async (params = {}) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const requestData = {
        order: params.order || null,
        offset: params.offset || 0,
        limit: params.limit || 100,
        search: params.search || null,
      };

      const response = await apiClient.post(
        `${API_ENDPOINTS.INVOICES_LIST}/${sessionId}`,
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
        error: response.data?.error || 'Ошибка получения списка накладных',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  create: async (invoiceData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.INVOICES_CREATE}/${sessionId}`,
        invoiceData
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
          id: response.data.id,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка создания накладной',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  update: async (invoiceData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.INVOICES_EDIT}/${sessionId}`,
        invoiceData
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
          id: response.data.id,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка редактирования накладной',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  delete: async (invoiceId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.INVOICES_DELETE}/${invoiceId}/${sessionId}`,
        {}
      );

      if (response.success && response.data?.OK) {
        return { success: true };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка удаления накладной',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  getProducts: async (invoiceId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.INVOICE_PRODUCTS_GET}/${invoiceId}/products/${sessionId}`
      );

      if (response.success) {
        return {
          success: true,
          data: response.data?.rows || [],
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка получения товаров',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  createProduct: async (productData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.INVOICE_PRODUCTS_CREATE}/${sessionId}`,
        productData
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
          id: response.data.id,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка создания товара',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  updateProduct: async (productData) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.INVOICE_PRODUCTS_EDIT}/${sessionId}`,
        productData
      );

      if (response.success && response.data?.OK) {
        return {
          success: true,
          id: response.data.id,
          note: response.data.note,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка редактирования товара',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  deleteProduct: async (productId) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const response = await apiClient.post(
        `${API_ENDPOINTS.INVOICE_PRODUCTS_DELETE}/${productId}/${sessionId}`,
        {}
      );

      if (response.success && response.data?.OK) {
        return { success: true };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка удаления товара',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },

  uploadImage: async (file) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.upload(
        `${API_ENDPOINTS.WAREHOUSE_UPLOAD_IMAGE}/${sessionId}`,
        formData
      );

      if (response.success && response.data?.success) {
        return {
          success: true,
          url: response.data.url,
          publicId: response.data.public_id,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка загрузки изображения',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || error.message || 'Ошибка сети',
      };
    }
  },

  getStatistics: async (params = {}) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const requestData = {
        invoice_ids: params.invoice_ids || null,
        date_from: params.date_from || null,
        date_to: params.date_to || null,
      };

      const response = await apiClient.post(
        `${API_ENDPOINTS.INVOICES_STATISTICS}/${sessionId}`,
        requestData
      );

      if (response.success && response.data?.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Ошибка получения статистики',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },
};

