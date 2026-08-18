export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "ab003bc6b90e0965f9a3596dc232c0a28881c7e5";
export const BUILD_TIME = "2026-08-18T10:37:19.632Z";
export const TINY_ENV = "dev";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
