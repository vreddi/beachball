import { findPackageRoot, findProjectRoot } from '../paths';
import fs from 'fs-extra';
import path from 'path';
import { getWorkspaces, listAllTrackedFiles } from 'workspace-tools';
import { PackageInfos } from '../types/PackageInfo';
import { infoFromPackageJson } from './infoFromPackageJson';
import { BeachballOptions } from '../types/BeachballOptions';

export function getPackageInfos(cwd: string, options?: BeachballOptions) {
  const projectRoot = findProjectRoot(cwd);
  const packageRoot = findPackageRoot(cwd);

  return (
    (projectRoot && getPackageInfosFromWorkspace(projectRoot, options)) ||
    (projectRoot && getPackageInfosFromNonWorkspaceMonorepo(projectRoot, options)) ||
    (packageRoot && getPackageInfosFromSingleRepo(packageRoot, options)) ||
    {}
  );
}

function getPackageInfosFromWorkspace(projectRoot: string, options?: BeachballOptions) {
  try {
    const packageInfos: PackageInfos = {};

    // first try using the workspace provided packages (if available)
    const workspaceInfo = getWorkspaces(projectRoot);

    if (workspaceInfo && workspaceInfo.length > 0) {
      workspaceInfo.forEach(info => {
        const { path: packagePath, packageJson } = info;
        const packageJsonPath = path.join(packagePath, 'package.json');

        try {
          packageInfos[packageJson.name] = infoFromPackageJson(packageJson, packageJsonPath, options);
        } catch (e) {
          // Pass, the package.json is invalid
          console.warn(`Invalid package.json file detected ${packageJsonPath}: `, e);
        }
      });

      return packageInfos;
    }
  } catch (e) {
    // not a recognized workspace from workspace-tools
  }
}

function getPackageInfosFromNonWorkspaceMonorepo(projectRoot: string, options?: BeachballOptions) {
  const packageJsonFiles = listAllTrackedFiles(['**/package.json', 'package.json'], projectRoot);

  const packageInfos: PackageInfos = {};

  if (packageJsonFiles && packageJsonFiles.length > 0) {
    packageJsonFiles.forEach(packageJsonPath => {
      try {
        const packageJsonFullPath = path.join(projectRoot, packageJsonPath);
        const packageJson = fs.readJSONSync(packageJsonFullPath);
        packageInfos[packageJson.name] = infoFromPackageJson(packageJson, packageJsonFullPath, options);
      } catch (e) {
        // Pass, the package.json is invalid
        console.warn(`Invalid package.json file detected ${packageJsonPath}: `, e);
      }
    });

    return packageInfos;
  }
}

function getPackageInfosFromSingleRepo(packageRoot: string, options?: BeachballOptions) {
  const packageInfos: PackageInfos = {};
  const packageJsonFullPath = path.resolve(packageRoot, 'package.json');
  const packageJson = fs.readJSONSync(packageJsonFullPath);
  packageInfos[packageJson.name] = infoFromPackageJson(packageJson, packageJsonFullPath, options);
  return packageInfos;
}
