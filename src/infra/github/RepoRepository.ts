import { IRepoRepository, Repo } from '../../domain/IRepoRepository';
import { OctokitFactory } from './OctokitFactory';

export class RepoRepository implements IRepoRepository {
  public constructor(private readonly octokitFactory: OctokitFactory) {}

  public async listForToken(token: string): Promise<ReadonlyArray<Repo>> {
    const octokit = this.octokitFactory(token);

    const allRepos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
      sort: 'full_name',
      direction: 'asc',
    });

    return allRepos.map((r) => ({
      id: r.id.toString(),
      name: r.full_name,
      webUrl: r.html_url,
    }));
  }
}
