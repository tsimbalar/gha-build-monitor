import { MetaInfo } from '../../meta';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
const MyOctokit = Octokit.plugin(throttling);

export type OctokitFactory = (token: string) => Octokit;

export function getOctokitFactory(meta: MetaInfo): OctokitFactory {
  return (token) => {
    const octokit: Octokit = new MyOctokit({
      auth: token,
      userAgent: `gha-build-monitor v${meta.version}`,
      throttle: {
        onRateLimit: (retryAfter: any, options: any) => {
          octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

          // Retry twice after hitting a rate limit error, then give up
          if (options.request.retryCount <= 2) {
            // eslint-disable-next-line no-console
            console.log(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
          return undefined;
        },
        onAbuseLimit: (retryAfter: any, options: any) => {
          // does not retry, only logs a warning
          octokit.log.warn(`Abuse detected for request ${options.method} ${options.url}`);
        },
      },
    });
    return octokit;
  };
}
