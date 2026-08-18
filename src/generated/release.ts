export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "c1f46fa51417284914085754ce821964242d3f46";
export const BUILD_TIME = "2026-08-18T11:00:28.618Z";
export const TINY_ENV = "local";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
