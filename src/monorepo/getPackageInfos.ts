import { findPackageRoot, findProjectRoot } from '../paths';
import fs from 'fs-extra';
import path from 'path';
import { getWorkspaces, listAllTrackedFiles } from 'workspace-tools';
import { BeachballPackageInfos } from '../types/BeachballPackageInfo';
import { infoFromPackageJson } from './infoFromPackageJson';
import { BetterOptions } from '../types/BeachballOptions';

export function getPackageInfos(cwd: string, options: BetterOptions | undefined) {
  const projectRoot = findProjectRoot(cwd);
  const packageRoot = findPackageRoot(cwd);

  return (
    (projectRoot && getPackageInfosFromWorkspace(projectRoot, options)) ||
    (projectRoot && getPackageInfosFromNonWorkspaceMonorepo(projectRoot, options)) ||
    (packageRoot && getPackageInfosFromSingleRepo(packageRoot, options)) ||
    {}
  );
}

function getPackageInfosFromWorkspace(projectRoot: string, sharedOptions: BetterOptions | undefined) {
  try {
    const packageInfos: BeachballPackageInfos = {};

    // first try using the workspace provided packages (if available)
    getWorkspaces(projectRoot).forEach(info => {
      const { path: packagePath, packageJson } = info;
      const packageJsonPath = path.join(packagePath, 'package.json');

      try {
        packageInfos[packageJson.name] = infoFromPackageJson(packageJson, packageJsonPath, sharedOptions);
      } catch (e) {
        // Pass, the package.json is invalid
        console.warn(`Invalid package.json file detected ${packageJsonPath}: `, e);
      }
    });

    return packageInfos;
  } catch (e) {
    // not a recognized workspace from workspace-tools
  }
}

function getPackageInfosFromNonWorkspaceMonorepo(projectRoot: string, sharedOptions: BetterOptions | undefined) {
  const packageJsonFiles = listAllTrackedFiles(['**/package.json', 'package.json'], projectRoot);

  const packageInfos: BeachballPackageInfos = {};

  packageJsonFiles.forEach(packageJsonPath => {
    try {
      const packageJsonFullPath = path.join(projectRoot, packageJsonPath);
      const packageJson = fs.readJSONSync(packageJsonFullPath);
      packageInfos[packageJson.name] = infoFromPackageJson(packageJson, packageJsonFullPath, sharedOptions);
    } catch (e) {
      // Pass, the package.json is invalid
      console.warn(`Invalid package.json file detected ${packageJsonPath}: `, e);
    }
  });

  return packageInfos;
}

function getPackageInfosFromSingleRepo(packageRoot: string, sharedOptions: BetterOptions | undefined) {
  const packageInfos: BeachballPackageInfos = {};
  const packageJsonFullPath = path.resolve(packageRoot, 'package.json');
  const packageJson = fs.readJSONSync(packageJsonFullPath);
  packageInfos[packageJson.name] = infoFromPackageJson(packageJson, packageJsonFullPath, sharedOptions);
  return packageInfos;
}
