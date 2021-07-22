import { cosmiconfigSync } from 'cosmiconfig';
import { BeachballOptions, PackageOptions } from '../types/BeachballOptions';
import { getCliOptions } from './getCliOptions';
import { getRepoOptions } from './getRepoOptions';
import { getDefaultOptions } from './getDefaultOptions';
import path from 'path';

/**
 * Gets all package level options (default + root options + package options + cli options).
 * This function inherits packageOptions from the repoOptions.
 * @param actualPackageOptions Options for the specific package
 * @param options Previously read default/repo/CLI options. If not provided, will be read from the filesystem.
 */
export function getCombinedPackageOptions(
  actualPackageOptions: Partial<PackageOptions>,
  options?: BeachballOptions
): PackageOptions {
  const cliOptions = getCliOptions(options?.argv || process.argv);
  return {
    ...(options || {
      ...getDefaultOptions(),
      ...getRepoOptions(cliOptions),
    }),
    ...actualPackageOptions,
    ...cliOptions,
  };
}

/**
 * Gets all the package options from the configuration file of the package itself without inheritance
 */
export function getPackageOptions(packagePath: string): Partial<PackageOptions> {
  const configExplorer = cosmiconfigSync('beachball', { cache: false });
  try {
    const results = configExplorer.load(path.join(packagePath, 'package.json'));
    return (results && results.config) || {};
  } catch (e) {
    // File does not exist, returns the default packageOptions
    return {};
  }
}
