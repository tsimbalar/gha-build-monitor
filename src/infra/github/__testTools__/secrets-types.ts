export interface Secrets {
  /**
   * Personal Access Token with no scope
   */
  readonly PAT_NO_SCOPE: string;
  /**
   * Personal Access Token with scope 'repo'
   */
  readonly PAT_SCOPE_REPO: string;
}
