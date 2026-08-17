export const APP_VERSION = '0.1.0';
export const COMMIT_SHA = 'local';
export const BUILD_TIME = 'unbuilt';
export const TINY_ENV = 'local';

export type ReleaseMetadata = {
  version: string;
  commitSha: string;
  buildTime: string;
  environment: string;
};

export const RELEASE: ReleaseMetadata = {
  version: APP_VERSION,
  commitSha: COMMIT_SHA,
  buildTime: BUILD_TIME,
  environment: TINY_ENV
};
