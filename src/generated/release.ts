export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "4a52837d45a6b86cf306c42bf377600b86b9b1a0";
export const BUILD_TIME = "2026-08-18T11:09:31.050Z";
export const TINY_ENV = "local";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
