import { User } from './IUserRepository';

export interface Repo {
  readonly id: string;
  readonly name: RepoName;
  readonly webUrl: string;
  /**
   * null when we don't have permissions to retrieve workflows !
   */
  readonly workflows: ReadonlyArray<Workflow>;
}

export class RepoName {
  public constructor(public readonly owner: string, public readonly name: string) {}

  public static parse(input: string): RepoName {
    const split = input
      .split('/')
      .filter((x) => Boolean(x))
      .map((x) => x?.trim())
      .filter((x) => Boolean(x));
    if (split.length !== 2) {
      throw new Error(`${input} is not a valid RepoName`);
    }
    return new RepoName(split[0], split[1]);
  }

  public get fullName(): string {
    return `${this.owner}/${this.name}`;
  }

  public localeCompare(other: RepoName): number {
    return this.fullName.localeCompare(other.fullName);
  }

  public belongsTo(owner: User): boolean {
    return this.owner === owner.login;
  }

  public equals(other: RepoName): boolean {
    return this.fullName === other.fullName;
  }
}

export interface Workflow {
  readonly id: string;
  readonly name: string;
  readonly webUrl: string;
}

export interface IRepoRepository {
  listForToken(token: string): Promise<ReadonlyArray<Repo>>;
}
