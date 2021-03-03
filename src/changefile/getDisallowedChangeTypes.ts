import { ChangeType } from '../types/ChangeInfo';
import { PackageGroups, BeachballPackageInfo } from '../types/BeachballPackageInfo';

export function getDisallowedChangeTypes(
  packageName: string,
  // packageInfo: Pick<BeachballPackageInfo, 'name' | 'combinedOptions'>,
  packageGroups: PackageGroups
): ChangeType[] | null {
  for (const groupName of Object.keys(packageGroups)) {
    const groupsInfo = packageGroups[groupName];
    if (groupsInfo.packageNames.indexOf(packageInfo.name) > -1) {
      return groupsInfo.disallowedChangeTypes;
    }
  }
  return packageInfo.combinedOptions.disallowedChangeTypes;
}
