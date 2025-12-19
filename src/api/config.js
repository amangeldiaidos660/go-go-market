export const API_CONFIG = {
  BASE_URL: 'https://alashcloud.kz',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

export const API_ENDPOINTS = {
  LOGIN: '/go/login',
  LOGOUT: '/logout',
  USERS_LIST: '/go/users/list',
  USERS_CREATE: '/go/users',
  USERS_EDIT: '/go/users/edit',
  USERS_DELETE: '/go/users/delete',
  ACCOUNTS_GET: '/go/accounts',
  ACCOUNTS_CREATE: '/go/accounts',
  ACCOUNTS_EDIT: '/go/accounts/edit',
  ACCOUNTS_DELETE: '/go/accounts/delete',
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
