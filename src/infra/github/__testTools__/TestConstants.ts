import { Repo, RepoName, Workflow } from '../../../domain/IRepoRepository';
import { User } from '../../../domain/IUserRepository';

export const THIS_REPO_OWNER: User = { id: '160544', login: 'tsimbalar' };

export const THIS_REPO_NAME = new RepoName(THIS_REPO_OWNER.login, 'gha-build-monitor');

export const THIS_REPO: Omit<Repo, 'workflows'> = {
  id: '318302976',
  name: THIS_REPO_NAME,
  webUrl: 'https://github.com/tsimbalar/gha-build-monitor',
};

export const THIS_REPO_MAIN_WORKFLOW: Workflow = {
  id: '4055612',
  name: 'Main',
  webUrl: 'https://api.github.com/repos/tsimbalar/gha-build-monitor/actions/workflows/4055612',
};
