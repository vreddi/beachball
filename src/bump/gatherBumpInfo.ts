import { getPackageChangeTypes } from '../changefile/getPackageChangeTypes';
import { readChangeFiles } from '../changefile/readChangeFiles';
import { ChangeSet } from '../types/ChangeInfo';
import { BumpInfo } from '../types/BumpInfo';
import { bumpInPlace } from './bumpInPlace';
import { BeachballOptions2 } from '../options/BeachballOptions2';
import { getScopedPackages } from '../monorepo/getScopedPackages';
import { getChangePath } from '../paths';
import path from 'path';
import { getDependents } from './getDependents';
import { getPackageGroups } from '../monorepo/getPackageGroups';

function gatherPreBumpInfo(options: BeachballOptions2): BumpInfo {
  const { path: cwd } = options;
  // Collate the changes per package
  const packageInfos = options.getBasicPackageInfos(true /*copy*/);
  const changes = readChangeFiles(options);
  const changePath = getChangePath(cwd);
  if (!changePath) {
    throw new Error(`Could not find "change" folder relative to `);
  }

  const dependentChangeTypes: BumpInfo['dependentChangeTypes'] = {};

  // Clear changes for non-existent and accidental private packages
  // NOTE: likely these are from the same PR that deleted or modified the private flag
  const filteredChanges: ChangeSet = new Map();
  for (let [changeFile, change] of changes) {
    const changeFilePath = path.resolve(changePath!, changeFile);
    if (!packageInfos[change.packageName]) {
      console.warn(
        `Invalid change file found: "${change.packageName}" does not exist (delete this file). "${changeFilePath}"`
      );
    } else if (packageInfos[change.packageName].private) {
      console.warn(
        `Invalid change file found: "${change.packageName}" is private (delete this file). "${changeFilePath}"`
      );
    } else {
      filteredChanges.set(changeFile, change);
      dependentChangeTypes[change.packageName] = change.dependentChangeType || 'patch';
    }
  }

  // Clear non-existent changeTypes
  const packageChangeTypes = getPackageChangeTypes(filteredChanges);
  Object.keys(packageChangeTypes).forEach(packageName => {
    if (!packageInfos[packageName]) {
      delete packageChangeTypes[packageName];
    }
  });

  const scopedPackages = getScopedPackages(options);
  const dependents = options.bumpDeps ? getDependents(packageInfos, scopedPackages) : {};

  return {
    packageChangeTypes,
    updatedPackageInfos: packageInfos,
    changes: filteredChanges,
    scopedPackages,
    dependentChangeTypes,
    dependents,
    // dependentChangeInfos: [],
  };
}

export function gatherBumpInfo(options: BeachballOptions2): BumpInfo {
  const bumpInfo = gatherPreBumpInfo(options);
  bumpInPlace(bumpInfo, options);
  return bumpInfo;
}
