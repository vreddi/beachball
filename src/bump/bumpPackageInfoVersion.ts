import { BumpInfo } from '../types/BumpInfo';
import semver from 'semver';
import { BeachballOptions } from '../types/BeachballOptions';

/**
 * Bumps an individual package version based on the change type.
 * Returns true if the package was bumped.
 */
export function bumpPackageInfoVersion(pkgName: string, bumpInfo: BumpInfo, options: BeachballOptions): boolean {
  const { packageChangeTypes, packageInfos, modifiedPackages } = bumpInfo;
  const info = packageInfos[pkgName];
  const changeType = packageChangeTypes[pkgName]?.type;
  if (!info) {
    console.log(`Unknown package named "${pkgName}" detected from change files, skipping!`);
  } else if (changeType === 'none') {
    console.log(`"${pkgName}" has a "none" change type, no version bump is required.`);
  } else if (info.private) {
    console.log(`Skipping bumping private package "${pkgName}"`);
  } else {
    info.version = semver.inc(info.version, changeType, options.prereleasePrefix) as string;
    modifiedPackages.add(pkgName);
    return true;
  }
  return false;
}
