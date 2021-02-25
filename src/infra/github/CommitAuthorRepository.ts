import { OctokitFactory } from './OctokitFactory';
import { RepoName } from '../../domain/IRepoRepository';

export interface CommitAuthor {
  readonly login: string;
  readonly name?: string;
}

export abstract class BaseCommitAuthorRepository {
  abstract getAuthorForCommit(
    token: string,
    repoName: RepoName,
    commitId: string
  ): Promise<CommitAuthor | null>;

  public async getAuthorsForCommits(
    token: string,
    repoName: RepoName,
    commitIds: readonly string[]
  ): Promise<Map<string, CommitAuthor>> {
    const promises = commitIds.map(async (id) => {
      const author = await this.getAuthorForCommit(token, repoName, id);
      return [id, author] as [string, CommitAuthor | null];
    });

    const commitsAndAuthors = await Promise.all(promises);
    const found = commitsAndAuthors.filter((kvp) => kvp[1] !== null) as [string, CommitAuthor][];
    return new Map<string, CommitAuthor>(found);
  }
}

export class CommitAuthorRepository extends BaseCommitAuthorRepository {
  public constructor(private readonly octokitFactory: OctokitFactory) {
    super();
  }

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
