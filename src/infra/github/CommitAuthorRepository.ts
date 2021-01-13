import { OctokitFactory } from './OctokitFactory';
import { RepoName } from '../../domain/IRepoRepository';

export interface CommitAuthor {
  readonly login: string;
  readonly name?: string;
}
export interface ICommitAuthorRepository {
  getAuthorForCommit(
    token: string,
    repoName: RepoName,
    commitId: string
  ): Promise<CommitAuthor | null>;
}

export class CommitAuthorRepository implements ICommitAuthorRepository {
  public constructor(private readonly octokitFactory: OctokitFactory) {}

  public async getAuthorForCommit(
    token: string,
    repoName: RepoName,
    commitId: string
  ): Promise<CommitAuthor | null> {
    const octokit = this.octokitFactory(token);

    const response = await octokit.repos.getCommit({
      owner: repoName.owner,
      repo: repoName.name,
      ref: commitId,
    });

    if (!response.data.author) {
      return null;
    }

    const result = {
      login: response.data.author.login,
      name: response.data.commit.author?.name,
    };
    return result;
  }
}
