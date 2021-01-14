import { Repo, RepoName } from '../../../domain/IRepoRepository';
import { CachedRepoRepository } from '../CachedRepoRepository';
import { InMemoryRepoRepository } from '../../memory/InMemoryRepoRepository';
import LRUCache from 'lru-cache';
import MockDate from 'mockdate';

describe('CachedRepoRepository', () => {
  describe('listForToken', () => {
    afterEach(() => {
      MockDate.reset();
    });

    test('should returned repos of wrapped repo', async () => {
      const existingRepo: Repo = {
        id: 'repo',
        name: new RepoName('owner', 'repo-name'),
        webUrl: 'http://www.perdu.com',
        workflows: [],
      };
      const token1 = 'token';
      const wrapped = new InMemoryRepoRepository();
      wrapped.addRepo(token1, existingRepo);

      const sut = new CachedRepoRepository(wrapped);

      const actual = await sut.listForToken(token1);

      expect(actual).toEqual([existingRepo]);
    });

    test('should cache during 1 minute', async () => {
      const token = 'tokenZ';
      const wrapped = new InMemoryRepoRepository();

      const spy = jest.spyOn(wrapped, 'listForToken');
      const sut = new CachedRepoRepository(wrapped);

      const actual1 = await sut.listForToken(token);
      expect(spy).toHaveBeenCalledTimes(1);

      // a new repo has been added ... but we are still hitting the cache
      const existingRepo: Repo = {
        id: 'repo',
        name: new RepoName('owner', 'repo-name'),
        webUrl: 'http://www.perdu.com',
        workflows: [],
      };
      wrapped.addRepo(token, existingRepo);

      const actual2 = await sut.listForToken(token);
      expect(actual2).toEqual(actual1);
      expect(spy).toHaveBeenCalledTimes(1);

      const after1Minute = new Date();
      after1Minute.setTime(after1Minute.getTime() + 1000 * 60 + 1);
      MockDate.set(after1Minute);
      // cache has expired
      const actual3 = await sut.listForToken(token);
      expect(actual3).not.toEqual(actual2);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    test('should cache per token', async () => {
      const token1 = 'token';
      const token2 = 'token2';
      const wrapped = new InMemoryRepoRepository();
      // a new repo has been added ... but we are still hitting the cache
      const existingRepo1: Repo = {
        id: 'repo1',
        name: new RepoName('owner', 'repo-name'),
        webUrl: 'http://www.perdu.com',
        workflows: [],
      };
      wrapped.addRepo(token1, existingRepo1);

      const sut = new CachedRepoRepository(wrapped);

      const actualForToken1 = await sut.listForToken(token1);

      const actualForToken2 = await sut.listForToken(token2);
      expect(actualForToken2).not.toEqual(actualForToken1);
    });
  });
});
