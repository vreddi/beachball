import { BumpInfo } from '../types/BumpInfo';
import semver from 'semver';
import { BeachballOptions2 } from '../options/BeachballOptions2';

/**
 * Bumps an individual package version based on the change type
 */
export function bumpPackageInfoVersion(pkgName: string, bumpInfo: BumpInfo, options: BeachballOptions2): void {
  const { packageChangeTypes, modifiedPackages, updatedPackageInfos } = bumpInfo;
  const info = options.getPackageInfo(pkgName);
  const changeType = packageChangeTypes[pkgName]?.type;

  if (!info) {
    console.log(`Unknown package named "${pkgName}" detected from change files, skipping!`);
  } else if (changeType === 'none') {
    console.log(`"${pkgName}" has a "none" change type, no version bump is required.`);
  } else if (info.private) {
    console.log(`Skipping bumping private package "${pkgName}"`);
  } else if (!semver.valid(info.version)) {
    console.log(`Skipping "${pkgName}" due to its invalid version "${info.version}"`);
  } else {
    const newVersion = semver.inc(info.version, changeType, options.prereleasePrefix);
    if (newVersion) {
      updatedPackageInfos[pkgName].version = newVersion;
      modifiedPackages.add(pkgName);
    } else {
      console.log(`Skipping "${pkgName}" because its verison could not be incremented by type "${changeType}"`);
    }
  }
}
