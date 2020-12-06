// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

const packageVersion: string = pkg.version;
const buildInfo: { [key: string]: string } = pkg.buildInfo as { [key: string]: string };

export interface MetaInfo {
  readonly version: string;
  readonly buildInfo: BuildInfo;
}

export type BuildInfo = { [key: string]: string };

export const meta: MetaInfo = {
  version: packageVersion,
  buildInfo,
};
