export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "b2d40eb0143349e743a76a62d60a3ae712208ae6";
export const BUILD_TIME = "2026-08-18T08:59:48.007Z";
export const TINY_ENV = "local";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
