// Definitions from the Catlight Protocol v1
// See https://github.com/catlightio/catlight-protocol

/**
 * @see https://github.com/catlightio/catlight-protocol#user
 */
interface User {
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
interface Build {
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
interface BuildBranch {
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

/**
 * @see https://github.com/catlightio/catlight-protocol#builddefinition
 */
interface BuildDefinition {
  /**
   * Id should be unique in parent space.
   */
  readonly id: string;

  /**
   * Display name
   */
  readonly name: string;

  /**
   * Branches array should include:
   *
   * Primary branches (master, develop, etc.)
   * Active feature branches that had builds in the past 30 days.
   *
   * If your system cannot separate builds into branches, add a single branch to this array with id = "~all"
   */
  readonly branches: BuildBranch[];

  /**
   * Webpage that provides user with detailed information about this build definition.
   */
  readonly webUrl?: string;

  /**
   * Path to the build definition, e.g. "my folder/sub-folder".
   */
  readonly folder?: string;
}

/**
 * Space is a logical container of build definitions. For most servers, space will map to a project or source control repository.
 *
 * CatLight apps exchange information about build investigations on space level. If your server has thousands of build definitions, put them into separate spaces to avoid performance problems.
 *
 * @see https://github.com/catlightio/catlight-protocol#space
 */
interface Space {
  /**
   * Space id should be unique on the server.
   */
  readonly id: string;

  /**
   * Display name
   */
  readonly name: string;

  readonly buildDefinitions: BuildDefinition[];

  /**
   * Url of the space page.
   */
  readonly webUrl?: string;
}

/**
 *
 * @see https://github.com/catlightio/catlight-protocol#server
 */
export interface Server {
  /**
   * Constant string that defines the version and mode of CatLight protocol.
   */
  readonly protocol:
    | 'https://catlight.io/protocol/v1.0/basic'
    | 'https://catlight.io/protocol/v1.0/dynamic';
  /**
   * Globally unique server id.
   *
   * Server id must be globally unique and should not change.
   *
   * # How to choose server id?
   * For online services, you can use your domain name, e.g. "myserver.com"
   * For installed servers, use your domain or product name + unique installation id. For example, "myserver.com/3A5126E7-EE74-48E4-9997-1C1DE52BA711". If your server does not have unique id, you can generate a GUID during installation and save it to configuration file.
   *
   * Try to keep the id shorter than 100 symbols. If your server has a built-in unique id that is very long, you can use a hash sum of it that should be shorter.
   */
  readonly id: string;

  /**
   * Display name of the server that is shown to the user.
   */
  readonly name: string;

  readonly spaces: Space[];

  /**
   * Url of the main server page.
   */
  readonly webUrl?: string;

  readonly serverVersion?: string;
  /**
   * Currently logged-in user. If it is absent, build investigation feature will not be available.
   */
  readonly currentUser?: User;
}
