import { BumpInfo } from '../types/BumpInfo';
import { Mutable } from '../types/Immutable';

/**
 * Gets dependents for all packages
 *
 * Example: "BigApp" deps on "SomeUtil", "BigApp" would be the dependent
 */
export function getDependents(
  updatedPackageInfos: BumpInfo['updatedPackageInfos'],
  scopedPackages: BumpInfo['scopedPackages']
): BumpInfo['dependents'] {
  const packages = Object.keys(updatedPackageInfos);
  const dependents: Mutable<BumpInfo['dependents']> = {};

  packages.forEach(pkgName => {
    if (!scopedPackages.has(pkgName)) {
      return;
    }

    const info = updatedPackageInfos[pkgName];
    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'] as const;
    depTypes.forEach(depType => {
      const deps = info[depType];
      if (deps) {
        for (let dep of Object.keys(deps)) {
          if (packages.includes(dep)) {
            dependents[dep] = dependents[dep] || [];
            if (!dependents[dep].includes(pkgName)) {
              dependents[dep].push(pkgName);
            }
          }
        }
      }
    });
  });

  return dependents;
}
