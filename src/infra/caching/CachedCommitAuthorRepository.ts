import { CommitAuthor, ICommitAuthorRepository } from '../github/CommitAuthorRepository';
import LRUCache from 'lru-cache';
import { RepoName } from '../../domain/IRepoRepository';

export class CachedCommitAuthorRepository implements ICommitAuthorRepository {
  public constructor(
    private readonly cache: LRUCache<string, any>,
    private readonly wrapped: ICommitAuthorRepository
  ) {}

  public async getAuthorForCommit(
    token: string,
    repoName: RepoName,
    commitId: string
  ): Promise<CommitAuthor | null> {
    const cacheKey = `${repoName.fullName}/commit(${encodeURIComponent(commitId)})`;
    const existing = this.cache.get(cacheKey);

    if (existing !== undefined) {
      return existing as CommitAuthor | null;
    }

    const actual = await this.wrapped.getAuthorForCommit(token, repoName, commitId);
    this.cache.set(cacheKey, actual, 60 * 60 * 1000); // cache for an hour
    return actual;
  }
}
