import { cosmiconfigSync } from 'cosmiconfig';
import { getDefaultRemoteBranch } from 'workspace-tools';
import { RepoOptions, CliOptions } from '../types/BeachballOptions';

/** @internal */
export function getRootOptions(cliOptions: Readonly<CliOptions>): RepoOptions {
  let config: RepoOptions;
  if (cliOptions.configPath) {
    const repoOptions = tryLoadConfig(cliOptions.configPath);
    if (!repoOptions) {
      console.error(`Config file "${cliOptions.configPath}" could not be loaded`);
      process.exit(1);
    }

    config = repoOptions;
  } else {
    config = trySearchConfig() || {};
  }

  if (!config.branch && !cliOptions.branch) {
    config.branch = getDefaultRemoteBranch('master', cliOptions.path, true /*strict*/);
  }

  return config;
}

function tryLoadConfig(configPath: string): RepoOptions {
  const configExplorer = cosmiconfigSync('beachball');
  const loadResults = configExplorer.load(configPath);
  return (loadResults && loadResults.config) || null;
}

function trySearchConfig(): RepoOptions {
  const configExplorer = cosmiconfigSync('beachball');
  const searchResults = configExplorer.search();
  return (searchResults && searchResults.config) || null;
}
