export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "5b0d83a080b6351beb12733ef26d613d867658f6";
export const BUILD_TIME = "2026-08-18T10:45:48.839Z";
export const TINY_ENV = "local";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
