// Definitions from the Catlight Protocol v1 - dynamic
// See https://github.com/catlightio/catlight-protocol

import { BuildBranch, User } from './shared';

/**
 * @see https://github.com/catlightio/catlight-protocol#builddefinition
 */
export interface BuildDefinitionMetadata {
  /**
   * Id should be unique in parent space.
   */
  readonly id: string;

  /**
   * Display name
   */
  readonly name: string;

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
export interface SpaceMetadata {
  /**
   * Space id should be unique on the server.
   */
  readonly id: string;

  /**
   * Display name
   */
  readonly name: string;

  readonly buildDefinitions: BuildDefinitionMetadata[];

  /**
   * Url of the space page.
   */
  readonly webUrl?: string;
}

/**
 *
 * @see https://github.com/catlightio/catlight-protocol#metadata-request
 */
export interface ServerMetadata {
  /**
   * Constant string that defines the version and mode of CatLight protocol.
   */
  readonly protocol: 'https://catlight.io/protocol/v1.0/dynamic';
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

  readonly spaces: SpaceMetadata[];

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

/**
 * @see https://github.com/catlightio/catlight-protocol#builddefinition
 */
export interface BuildDefinitionStateRequest {
  /**
   * Id should be unique in parent space.
   */
  readonly id: string;
}

interface SpaceStateRequest {
  /**
   * Space id should be unique on the server.
   */
  readonly id: string;
  readonly buildDefinitions: BuildDefinitionStateRequest[];
}

/**
 * @see https://github.com/catlightio/catlight-protocol#state-request
 */
export interface ServerStateRequest {
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
  readonly spaces: SpaceStateRequest[];
}

/**
 * @see https://github.com/catlightio/catlight-protocol#builddefinition
 */
export interface BuildDefinitionStateResponse {
  /**
   * Id should be unique in parent space.
   */
  readonly id: string;

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
   * Path to the build definition, e.g. "my folder/sub-folder".
   */
  readonly folder?: string;
}

export interface SpaceStateResponse {
  /**
   * Space id should be unique on the server.
   */
  readonly id: string;

  readonly buildDefinitions: BuildDefinitionStateResponse[];
}

export interface ServerStateResponse {
  /**
   * Constant string that defines the version and mode of CatLight protocol.
   */
  readonly protocol: 'https://catlight.io/protocol/v1.0/basic';
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

  readonly spaces: SpaceStateResponse[];
}
