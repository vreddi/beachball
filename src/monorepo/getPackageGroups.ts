import { VersionGroupOptions } from '../types/BeachballOptions';
import path from 'path';
import { PackageInfos } from 'workspace-tools';
import { PackageGroupInfo, PackageGroups } from '../types/BeachballPackageInfo';
import { isPathIncluded } from './utils';
import { Immutable, Mutable } from '../types/Immutable';

export function getPackageGroups(
  packageInfos: Immutable<PackageInfos>,
  root: string,
  groups: Immutable<VersionGroupOptions[]> | undefined
): Immutable<PackageGroups> {
  const packageGroups: { [groupName: string]: PackageGroupInfo } = {};

  if (groups) {
    // Check every package to see which group it belongs to
    for (const [pkgName, info] of Object.entries(packageInfos)) {
      const packagePath = path.dirname(info.packageJsonPath);
      const relativePath = path.relative(root, packagePath);

      const seenPackages: { [packageName: string]: string } = {};
      for (const groupOption of groups) {
        const { include, exclude, name, ...options } = groupOption;

        if (isPathIncluded(relativePath, include, exclude)) {
          if (seenPackages[pkgName]) {
            console.error(`Error: ${pkgName} cannot belong to multiple groups: [${name}, ${seenPackages[pkgName]}]!`);
            process.exit(1);
          }

          seenPackages[pkgName] = name;
          // packageInfos[pkgName].group = name;

          if (!packageGroups[name]) {
            packageGroups[name] = {
              name,
              packageNames: [],
              ...(options as Mutable<typeof options>),
            };
          }

          packageGroups[name].packageNames.push(pkgName);
        }
      }
    }
  }

  return packageGroups;
}
