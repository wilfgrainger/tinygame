export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "17a8f0405dba1b38dc0ed88efa979ca271fe4069";
export const BUILD_TIME = "2026-08-18T09:59:37.644Z";
export const TINY_ENV = "dev";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
