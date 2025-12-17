export const API_CONFIG = {
  BASE_URL: 'https://alashcloud.kz',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

export const API_ENDPOINTS = {
  LOGIN: '/',
  LOGOUT: '/logout',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
};
