import { IRepoRepository, Repo } from '../../domain/IRepoRepository';

export class InMemoryRepoRepository implements IRepoRepository {
  private readonly reposByToken: Map<string, Repo[]> = new Map<string, Repo[]>();

  public async listForToken(token: string): Promise<ReadonlyArray<Repo>> {
    const reposForToken = this.reposByToken.get(token) ?? [];
    return [...reposForToken].sort((a, b) => a.name.localeCompare(b.name));
  }

  public addRepo(token: string, repo: Repo): void {
    const reposForToken = this.reposByToken.get(token) ?? [];
    reposForToken.push(repo);
    this.reposByToken.set(token, reposForToken);
  }
}
