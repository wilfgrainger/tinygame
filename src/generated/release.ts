export const APP_VERSION = "0.1.0";
export const COMMIT_SHA = "d183c584cefb729661370f364c6fcb59994d3152";
export const BUILD_TIME = "2026-08-18T11:27:14.329Z";
export const TINY_ENV = "local";

export type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };
export const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };
