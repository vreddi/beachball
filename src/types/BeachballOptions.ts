import { ChangeType } from './ChangeInfo';
import { ChangeFilePromptOptions } from './ChangeFilePrompt';
import { ChangelogOptions } from './ChangelogOptions';

// export interface BetterOptions {
//   cwd: string;
//   defaultOptions: Partial<BeachballOptions>;
//   cliOptions: CliOptions;
//   repoOptions: RepoOptions;
//   packageOptions?: PackageOptions;
// }
export type BeachballOptions = CommonOptions &
  InferredOptions &
  RepoOptions &
  PackageOptions &
  Omit<CliOptions, 'command' | 'help' | 'version'>;

export interface InferredOptions {
  /** Project root, used for running commands and looking for packages */
  path: string;
}

/** These can be specified in repo-level configs or on the command line. */
export interface CommonOptions {
  /**
   * Branch to compare against. In the final options, this will have format `remoteName/branchName`.
   * On the command line or in repo options, the remote name can be omitted.
   */
  branch: string;

  registry?: string;
  gitTags?: boolean;
  tag?: string;
  push?: boolean;
  publish?: boolean;
  bumpDeps?: boolean;
  fetch?: boolean;
  access?: 'public' | 'restricted';
  changehint?: string;
  /** number of retries for a package publish before failing */
  retries: number;
  disallowedChangeTypes?: ChangeType[];
}

export interface CliOptions extends Partial<CommonOptions> {
  // CLI-specific options processed at top level
  /** command to run */
  command?: string;
  /** show help and exit */
  help?: boolean;
  /** show version and exit */
  version?: boolean;

  // other options
  all?: boolean;
  /** For `change` command, message for the change file. For `publish` command, commit message. */
  message?: string;
  token?: string;
  yes?: boolean;
  new?: boolean;
  package?: string;
  type?: ChangeType;
  scope?: string[];
  timeout?: number;
  fromRef?: string;
  keepChangeFiles?: boolean;
  bump?: boolean;
  canaryName?: string;
  forceVersions?: boolean;
  dependentChangeType?: ChangeType;
  disallowDeletedChangeFiles?: boolean;
  prereleasePrefix?: string;
  configPath?: string;
  commit?: boolean;
}

export interface RepoHooks {
  /**
   * Runs for each package after version bumps have been processed and committed to git, but before the actual
   * publish command.
   *
   * This allows for file modifications which will be reflected in the published package but not be reflected in the
   * repository.
   */
  prepublish?: (packagePath: string, name: string, version: string) => void | Promise<void>;

  /**
   * Runs for each package after the publish command.
   * Any file changes made in this step will **not** be committed automatically.
   */
  postpublish?: (packagePath: string, name: string, version: string) => void | Promise<void>;
}

export interface RepoOptions extends Partial<CommonOptions> {
  defaultNpmTag?: string;
  generateChangelog?: boolean;

  groups?: VersionGroup[];
  changelog?: ChangelogOptions;
  changeFilePrompt?: ChangeFilePromptOptions;

  hooks?: RepoHooks;
}

export interface PackageOptions {
  gitTags?: boolean;
  disallowedChangeTypes?: ChangeType[];
  tag?: string;
  defaultNpmTag?: string;
  changeFilePrompt?: ChangeFilePromptOptions;
  // For new properties to be respected, they MUST ALSO BE ADDED TO ...........
}

// For new properties to be respected, they MUST ALSO BE ADDED TO ...........
export type VersionGroupOptions = Pick<PackageOptions, 'disallowedChangeTypes'>;

export interface VersionGroup extends VersionGroupOptions {
  /** minimatch pattern (or array of minimatch) to detect which packages should be included in this group */
  include: string | string[];

  /** minimatch pattern (or array of minimatch) to detect which packages should be excluded in this group */
  exclude?: string | string[];

  /** name of the version group */
  name: string;
}
