import { IRepoRepository, Repo, RepoName, Workflow } from '../../domain/IRepoRepository';
import { Octokit } from '@octokit/rest';
import { OctokitFactory } from './OctokitFactory';

export class RepoRepository implements IRepoRepository {
  public constructor(private readonly octokitFactory: OctokitFactory) {}

  public async listForToken(token: string): Promise<ReadonlyArray<Repo>> {
    const octokit = this.octokitFactory(token);

    const allRepos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
      sort: 'full_name',
      direction: 'asc',
    });

    const workflowsPerRepo = await this.getWorkflowsPerRepo(
      octokit,
      allRepos.map((r) => new RepoName(r.owner.login, r.name))
    );

    return allRepos.map((r) => ({
      id: r.id.toString(),
      name: new RepoName(r.owner.login, r.name),
      webUrl: r.html_url,
      workflows: workflowsPerRepo.get(r.full_name) ?? [],
    }));
  }

  private async getWorkflowsPerRepo(
    octokit: Octokit,
    repos: RepoName[]
  ): Promise<Map<string, Workflow[]>> {
    const allWorkFlows = await Promise.all(
      repos.map(async (repo) => {
        const payload = await octokit.paginate(octokit.actions.listRepoWorkflows, {
          owner: repo.owner,
          repo: repo.name,
        });

        const mappedWorkFlows = payload.map<Workflow>((w) => ({
          id: w.id.toString(),
          name: w.name,
          webUrl: w.html_url,
        }));

        return [repo.fullName, mappedWorkFlows] as [string, Workflow[]];
      })
    );

    return new Map(allWorkFlows);
  }
}
