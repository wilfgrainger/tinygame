import type { ApiErrorCode } from '../shared/errors';
import type { ApiFailure, ApiSuccess } from '../shared/api';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

export function ok<T>(data: T, init: ResponseInit = {}): Response {
  const body: ApiSuccess<T> = { ok: true, data };
  return new Response(JSON.stringify(body), { ...init, headers: { ...JSON_HEADERS, ...(init.headers || {}) } });
}

export function fail(status: number, code: ApiErrorCode, message: string, headers: HeadersInit = {}): Response {
  const body: ApiFailure = { ok: false, error: { code, message } };
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } });
}

export class ApiHttpError extends Error {
  constructor(public readonly status: number, public readonly code: ApiErrorCode, message: string, public readonly headers: HeadersInit = {}) {
    super(message);
  }
}
