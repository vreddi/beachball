import { getMaxChangeType, MinChangeType, updateChangeInfoWithMaxType } from '../changefile/getPackageChangeTypes';
import { BeachballOptions2 } from '../options/BeachballOptions2';
import { BumpInfo } from '../types/BumpInfo';
import { ChangeInfo } from '../types/ChangeInfo';

/**
 * Updates package change types based on dependents
 * (e.g given A -> B, if B has a minor change, A should also have minor change)
 *
 * This function is recursive: it will update related dependent packages noting groups and bumpDeps flag
 */
export function updateRelatedChangeType(
  pkgName: string,
  changeInfo: ChangeInfo,
  bumpInfo: BumpInfo,
  dependentChangeInfos: Map<string, Map<string, ChangeInfo>>,
  bumpDeps: boolean | undefined,
  options: BeachballOptions2
) {
  const packageGroups = options.getPackageGroups() || {};
  const { packageChangeTypes, dependents, dependentChangeTypes } = bumpInfo;

  const disallowedChangeTypes = options.resolve('disallowedChangeTypes', pkgName) || [];

  const depChangeInfo = updateChangeInfoWithMaxType(
    changeInfo,
    MinChangeType,
    dependentChangeTypes[pkgName],
    disallowedChangeTypes
  );

  const dependentPackages = dependents[pkgName];

  // Handle groups
  packageChangeTypes[pkgName] = updateChangeInfoWithMaxType(
    packageChangeTypes[pkgName],
    changeInfo.type,
    packageChangeTypes[pkgName]?.type,
    disallowedChangeTypes
  );

  const groupOptions = options.getGroupForPackage(pkgName);
  if (groupOptions) {
    let groupChangeInfo: ChangeInfo = {
      ...changeInfo,
      type: MinChangeType,
    };
    const packageNamesInGroup = packageGroups[groupOptions.name].packageNames;

    // calculate maxChangeType
    packageNamesInGroup.forEach(groupPkgName => {
      groupChangeInfo = {
        ...groupChangeInfo,
        type: getMaxChangeType(
          groupChangeInfo.type,
          packageChangeTypes[groupPkgName]?.type,
          groupOptions.disallowedChangeTypes
        ),
      };

      // disregard the target disallowed types for now and will be culled at the subsequent update steps
      dependentChangeTypes[groupPkgName] = getMaxChangeType(depChangeInfo.type, dependentChangeTypes[groupPkgName], []);
    });

    packageNamesInGroup.forEach(groupPkgName => {
      if (packageChangeTypes[groupPkgName]?.type !== groupChangeInfo.type) {
        updateRelatedChangeType(groupPkgName, groupChangeInfo, bumpInfo, dependentChangeInfos, bumpDeps, options);
      }
    });
  }

  if (bumpDeps && dependentPackages) {
    new Set(dependentPackages).forEach(parent => {
      if (packageChangeTypes[parent]?.type !== depChangeInfo.type) {
        // propagate the dependentChangeType of the current package to the subsequent related packages
        dependentChangeTypes[parent] = depChangeInfo.type;

        let changeInfos = dependentChangeInfos.get(pkgName);
        if (!changeInfos) {
          changeInfos = new Map<string, ChangeInfo>();
          dependentChangeInfos.set(pkgName, changeInfos);
        }

        const prevChangeInfo = changeInfos.get(parent);
        let nextChangeInfo: ChangeInfo = {
          type: depChangeInfo.type,
          packageName: parent,
          email: depChangeInfo.email,
          commit: depChangeInfo.commit,
          comment: '', // comment will be populated at later stages when new versions are computed
        };

        if (prevChangeInfo) {
          nextChangeInfo = {
            ...nextChangeInfo,
            type: getMaxChangeType(prevChangeInfo.type, nextChangeInfo.type, disallowedChangeTypes),
          };
        }

        changeInfos.set(parent, nextChangeInfo);
        updateRelatedChangeType(parent, depChangeInfo, bumpInfo, dependentChangeInfos, bumpDeps, options);
      }
    });
  }
}
