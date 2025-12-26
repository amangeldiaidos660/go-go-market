import { API_CONFIG } from './config';

class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.HEADERS;
    this.sessionId = null;
  }

  setSessionId(sessionId) {
    this.sessionId = sessionId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
    }
  }

  getSessionId() {
    return this.sessionId;
  }

  clearSessionId() {
    this.sessionId = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('sessionId');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          data,
        };
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          success: false,
          error: 'Время ожидания истекло',
          code: 'TIMEOUT',
        };
      }

      if (error.status) {
        if (error.status === 403 || error.status === 401) {
          this.clearSessionId();
          if (typeof window !== 'undefined' && window.handleSessionExpired) {
            window.handleSessionExpired();
          }
        }
        throw {
          success: false,
          error: error.data?.detail || error.statusText,
          status: error.status,
          data: error.data,
        };
      }

      throw {
        success: false,
        error: 'Ошибка сети. Проверьте подключение к интернету.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post(endpoint, data = {}, options = {}) {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    const headers = typeof data === 'string' ? options.headers : {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body,
      headers,
    });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  async upload(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        ...options,
      });
      
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          data,
        };
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          success: false,
          error: 'Время ожидания истекло',
          code: 'TIMEOUT',
        };
      }

      if (error.status) {
        if (error.status === 403 || error.status === 401) {
          this.clearSessionId();
          if (typeof window !== 'undefined' && window.handleSessionExpired) {
            window.handleSessionExpired();
          }
        }
        throw {
          success: false,
          error: error.data?.error || error.data?.detail || error.statusText,
          status: error.status,
          data: error.data,
        };
      }

      throw {
        success: false,
        error: error.message || 'Ошибка сети. Проверьте подключение к интернету.',
        code: 'NETWORK_ERROR',
      };
    }
  }
}

export default new ApiClient();
