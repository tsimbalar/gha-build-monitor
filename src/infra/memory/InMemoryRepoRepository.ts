import { IRepoRepository, Repo } from '../../domain/IRepoRepository';

export class InMemoryRepoRepository implements IRepoRepository {
  private readonly repos: Repo[] = [];

  public async listForToken(token: string): Promise<ReadonlyArray<Repo>> {
    return [...this.repos].sort((a, b) => a.name.localeCompare(b.name));
  }

  public addRepo(repo: Repo): void {
    this.repos.push(repo);
  }
}
