export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "89a2f72ffa870ab0e358eb86ce2e0dc371b21462";
export const BUILD_TIME = "2026-08-18T10:36:43.576Z";
export const TINY_ENV = "local";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
