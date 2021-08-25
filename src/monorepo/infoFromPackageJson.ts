import path from 'path';
import { BeachballPackageInfo, PackageJson } from '../types/BeachballPackageInfo';
import { getPackageOptions } from '../options/getPackageOptions';

export function infoFromPackageJson(packageJson: PackageJson, packageJsonPath: string): BeachballPackageInfo {
  const packageOptions = getPackageOptions(path.dirname(packageJsonPath));
  return {
    name: packageJson.name!,
    version: packageJson.version,
    packageJsonPath,
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
    peerDependencies: packageJson.peerDependencies,
    private: packageJson.private !== undefined ? packageJson.private : false,
    packageOptions,
  };
}
