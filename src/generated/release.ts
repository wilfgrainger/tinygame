export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "a16fc72d6f3052519782c45caeb185ee16e27bed";
export const BUILD_TIME = "2026-08-18T11:28:24.098Z";
export const TINY_ENV = "dev";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
