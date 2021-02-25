import { BaseCommitAuthorRepository, CommitAuthor } from '../github/CommitAuthorRepository';
import LRUCache from 'lru-cache';
import { RepoName } from '../../domain/IRepoRepository';

export class CachedCommitAuthorRepository extends BaseCommitAuthorRepository {
  private readonly cache = new LRUCache<string, any>({
    // sliding expiration
    updateAgeOnGet: true,
    // keep commit information for 15 minutes, sliding
    maxAge: 15 * 60 * 1000,
  });

  public constructor(private readonly wrapped: BaseCommitAuthorRepository) {
    super();
  }

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
    this.cache.set(cacheKey, actual);
    return actual;
  }
}
