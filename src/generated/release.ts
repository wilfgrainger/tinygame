export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "ff5c13f972322f551e6ce3d8ae95aaabf4448447";
export const BUILD_TIME = "2026-08-18T11:36:59.015Z";
export const TINY_ENV = "dev";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
