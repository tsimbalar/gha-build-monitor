import { IRepoRepository, Repo } from '../../domain/IRepoRepository';
import LRUCache from 'lru-cache';
import { createHash } from 'crypto';

export class CachedRepoRepository implements IRepoRepository {
  public constructor(
    private readonly cache: LRUCache<string, any>,
    private readonly wrapped: IRepoRepository
  ) {}

  public async listForToken(token: string): Promise<ReadonlyArray<Repo>> {
    const tokenHash = createHash('sha1').update(token).digest('base64');
    const uriEscapedTokenHash = encodeURIComponent(tokenHash);
    const cacheKey = `token("${uriEscapedTokenHash}")/repos`;
    const existing = this.cache.get(cacheKey);
    if (existing !== undefined) {
      return existing as ReadonlyArray<Repo>;
    }

    const actual = await this.wrapped.listForToken(token);
    this.cache.set(cacheKey, actual, 60 * 1000);
    return actual;
  }
}
