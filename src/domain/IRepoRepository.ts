export interface Repo {
  readonly id: string;
  readonly name: string;
  readonly webUrl: string;
  /**
   * null when we don't have permissions to retrieve workflows !
   */
  readonly workflows: ReadonlyArray<Workflow>;
}

export interface Workflow {
  readonly id: string;
  readonly name: string;
  readonly webUrl: string;
}

export interface IRepoRepository {
  listForToken(token: string): Promise<ReadonlyArray<Repo>>;
}
