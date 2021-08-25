import { BumpInfo } from '../types/BumpInfo';
import { updateRelatedChangeType } from './updateRelatedChangeType';
import { bumpPackageInfoVersion } from './bumpPackageInfoVersion';
import { BeachballOptions2 } from '../options/BeachballOptions2';
import { setDependentVersions } from './setDependentVersions';
import { ChangeInfo } from '../types/ChangeInfo';

/**
 * Updates BumpInfo according to change types, bump deps, and version groups
 *
 * NOTE: THIS FUNCTION MUTATES STATE (bumpInfo)! It does not modify the filesystem.
 */
export function bumpInPlace(bumpInfo: BumpInfo, options: BeachballOptions2) {
  const { bumpDeps } = options;
  const { scopedPackages, packageChangeTypes, modifiedPackages } = bumpInfo;
  const packageInfos = options.getBasicPackageInfos();

  // pass 1: figure out all the change types for all the packages taking into account the bumpDeps option and version groups
  const dependentChangeInfos = new Map<string, Map<string, ChangeInfo>>();
  Object.keys(packageChangeTypes).forEach(pkgName => {
    updateRelatedChangeType(pkgName, packageChangeTypes[pkgName], bumpInfo, dependentChangeInfos, bumpDeps, options);
  });

  // pass 2: actually bump the packages in the bumpInfo in memory (no disk writes at this point)
  Object.keys(packageChangeTypes).forEach(pkgName => {
    bumpPackageInfoVersion(pkgName, bumpInfo, options);
  });

  // pass 3: update the dependentChangeInfos with relevant comments
  dependentChangeInfos.forEach((changeInfos, dependencyName) => {
    for (let changeInfo of changeInfos.values()) {
      changeInfo.comment = `Bump ${dependencyName} to v${packageInfos[dependencyName].version}`;
      bumpInfo.dependentChangeInfos.push(changeInfo);
    }
  });

  // pass 4: Bump all the dependencies packages
  const dependentModifiedPackages = setDependentVersions(packageInfos, scopedPackages);
  dependentModifiedPackages.forEach(pkg => modifiedPackages.add(pkg));

  return bumpInfo;
}
