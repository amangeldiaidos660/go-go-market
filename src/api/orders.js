import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const ordersApi = {
  getOrdersByMachid: async (machid) => {
    try {
      const sessionId = apiClient.getSessionId();
      if (!sessionId) {
        return { success: false, error: 'Сессия не найдена' };
      }

      const url = `${API_ENDPOINTS.ORDERS_BY_MACHID}/${machid}?sessionid=${sessionId}`;
      const response = await apiClient.get(url);

      if (response.success) {
        const orders = response.data?.orders || response.orders || [];
        const paidOrders = orders.filter(order => order.status === 'paid');
        return {
          success: true,
          data: paidOrders,
        };
      }

      if (response.orders) {
        const paidOrders = (response.orders || []).filter(order => order.status === 'paid');
        return {
          success: true,
          data: paidOrders,
        };
      }

      return {
        success: false,
        error: response.error || response.data?.error || 'Ошибка получения транзакций',
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Ошибка сети',
      };
    }
  },
};

