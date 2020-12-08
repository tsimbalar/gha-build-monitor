export interface Repo {
  readonly id: string;
  readonly name: string;
  readonly webUrl: string;
}

export interface IRepoRepository {
  listForToken(token: string): Promise<ReadonlyArray<Repo>>;
}
