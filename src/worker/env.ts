export interface D1Result<T = unknown> {
  success?: boolean;
  results?: T[];
  meta?: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

export interface Env {
  DB: D1DatabaseLike;
  ASSETS: AssetsBinding;
  GOOGLE_CLIENT_ID: string;
  ALLOWED_ORIGIN: string;
  SESSION_PEPPER: string;
  AUTH_RATE_LIMIT_SALT: string;
  TINY_ENV: string;
}
