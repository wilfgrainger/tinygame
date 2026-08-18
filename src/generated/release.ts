export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "4221de925ad7ad3fb281bca4572091f538975926";
export const BUILD_TIME = "2026-08-18T11:13:17.348Z";
export const TINY_ENV = "local";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
