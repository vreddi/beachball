import path from 'path';
import { PackageInfo, PackageJson } from '../types/PackageInfo';
import { getPackageOptions, getCombinedPackageOptions } from '../options/getPackageOptions';
import { BeachballOptions } from '../types/BeachballOptions';

export function infoFromPackageJson(
  packageJson: PackageJson,
  packageJsonPath: string,
  options?: BeachballOptions
): PackageInfo {
  const packageOptions = getPackageOptions(path.dirname(packageJsonPath));
  return {
    name: packageJson.name!,
    version: packageJson.version,
    packageJsonPath,
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
    peerDependencies: packageJson.peerDependencies,
    private: packageJson.private !== undefined ? packageJson.private : false,
    combinedOptions: getCombinedPackageOptions(packageOptions, options),
    packageOptions,
  };
}
