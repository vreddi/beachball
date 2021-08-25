import { PackageInfos } from 'workspace-tools';
import { BeachballOptions2 } from '../options/BeachballOptions2';
import { PackageGroups } from '../types/BeachballPackageInfo';
import { ChangeType } from '../types/ChangeInfo';

export function getDisallowedChangeTypes(packageName: string, options: BeachballOptions2): ChangeType[] | undefined {
  const packageGroups = options.getPackageGroups();
  if (packageGroups) {
    for (const [groupName, groupsInfo] of Object.entries(packageGroups)) {
      if (groupsInfo.packageNames.indexOf(packageName) > -1) {
        return groupsInfo.disallowedChangeTypes;
      }
    }
  }
  return options.resolve('disallowedChangeTypes', packageName);
}
