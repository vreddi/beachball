import { PackageVersionInfos } from '../types/BumpInfo';
import { bumpMinSemverRange } from './bumpMinSemverRange';

/**
 * Update all version references to within-repo deps to request \>= the current version.
 * @param updatedPackageInfos Package infos to update (WILL BE MUTATED)
 * @param scopedPackages Package names that are in scope to update
 * @returns Names of modified packages
 */
export function setDependentVersions(packageInfos: PackageVersionInfos, scopedPackages: ReadonlySet<string>) {
  const modifiedPackages = new Set<string>();
  Object.entries(packageInfos).forEach(([pkgName, info]) => {
    if (!scopedPackages.has(pkgName)) {
      return;
    }

    (['dependencies', 'devDependencies', 'peerDependencies'] as const).forEach(depKind => {
      const deps = info[depKind];
      if (deps) {
        Object.keys(deps).forEach(dep => {
          const depInfo = packageInfos[dep];
          if (depInfo) {
            const existingVersionRange = deps[dep];
            const bumpedVersionRange = bumpMinSemverRange(depInfo.version, existingVersionRange);
            if (existingVersionRange !== bumpedVersionRange) {
              deps[dep] = bumpedVersionRange;
              modifiedPackages.add(pkgName);
            }
          }
        });
      }
    });
  });

  return modifiedPackages;
}
