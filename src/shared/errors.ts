export const API_ERROR_CODES = [
  'AUTH_REQUIRED',
  'INVALID_REQUEST',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'SAVE_FAILED',
  'UNSUPPORTED_VERSION',
  'RATE_LIMITED',
  'INTERNAL'
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
