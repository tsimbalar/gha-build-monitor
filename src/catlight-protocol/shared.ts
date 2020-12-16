// Definitions from the Catlight Protocol v1 - shared
// See https://github.com/catlightio/catlight-protocol

/**
 * If your system cannot separate builds into branches, add a single branch to this array with id = "~all"
 */
export const BRANCHES_ALL_ID = '~all';

/**
 * @see https://github.com/catlightio/catlight-protocol#user
 */
export interface User {
  /**
   * Display name
   */
  readonly name: string;
  /**
   * Id should be unique within the server
   */
  readonly id: string;
}

/**
 * @see https://github.com/catlightio/catlight-protocol#build
 */
export interface Build {
  /**
   * Id should be unique within the parent build definition.
   */
  readonly id: string;
  readonly name?: string;
  /**
   * Build status
   */
  readonly status:
    | 'Queued'
    | 'Running'
    | 'Succeeded'
    | 'PartiallySucceeded'
    | 'Failed'
    | 'Canceled';

  /**
   * Date and time when this build was started.
   */
  readonly startTime: Date;

  /**
   * Should be present for completed builds, but can be absent for running builds.
   */
  readonly finishTime?: Date;

  /**
   * User that requested the build. If the build started automatically after new commit, this should be the user that committed the code.
   */
  readonly triggeredByUser?: User;

  /**
   * When the build contains changes from multiple user, additional contributors can be placed here.
   */
  readonly contributors?: User[];

  /**
   * Web page with build details
   */
  readonly webUrl?: string;
}

/**
 * @see https://github.com/catlightio/catlight-protocol#buildbranch
 */
export interface BuildBranch {
  /**
   * Id should be unique within the parent build definition.
   *
   * Branch id can be taken from source control. Examples:
   * - refs/heads/features/test-feature-branch
   * - refs/heads/master
   * - refs/pull/2/merge
   * - refs/remotes/origin/features/test-feature-branch
   *
   * CatLight will cleanup branch id and use it as a display name for the branch. For example, "refs/heads/master" will be transformed into "master".
   *
   * Note: if you don't see the branch in CatLight app UI, make sure that it has recent builds.
   */
  readonly id: string;

  /**
   * Sorted array of builds. Last build in the array should be the newest. Return 5-10 builds for each branch.
   */
  readonly builds: Build[];

  readonly webUrl?: string;
}
