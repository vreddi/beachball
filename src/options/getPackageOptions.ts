import { cosmiconfigSync } from 'cosmiconfig';
import { PackageOptions, BetterOptions } from '../types/BeachballOptions';
import path from 'path';

/**
 * Gets all package level options (default + root options + package options + cli options)
 * This function inherits packageOptions from the rootOptions
 */
export function getCombinedPackageOptions(
  actualPackageOptions: Partial<PackageOptions>,
  sharedOptions: BetterOptions
): PackageOptions {
  const { defaultOptions, repoOptions, cliOptions } = sharedOptions;
  return {
    ...defaultOptions,
    ...repoOptions,
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
