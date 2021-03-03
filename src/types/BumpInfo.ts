import { ChangeInfo, ChangeSet, ChangeType } from './ChangeInfo';
import { BeachballPackageInfos, PackageGroups } from './BeachballPackageInfo';
import { VersionGroupOptions } from './BeachballOptions';

export type BumpInfo = {
  changes: ChangeSet;
  packageInfos: BeachballPackageInfos;
  // options: BetterOptions;
  packageChangeTypes: { [pkgName: string]: ChangeInfo };
  packageGroups: PackageGroups;
  groupOptions: { [grp: string]: VersionGroupOptions };
  dependents: { [pkgName: string]: string[] };
  dependentChangeTypes: { [pkgName: string]: ChangeType };
  dependentChangeInfos: ChangeInfo[];
  modifiedPackages: Set<string>;
  newPackages: Set<string>;
  scopedPackages: Set<string>;
};
