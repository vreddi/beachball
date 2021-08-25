import { cosmiconfigSync } from 'cosmiconfig';
import { PackageOptions } from '../types/BeachballOptions';
import path from 'path';

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
