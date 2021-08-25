import { ChangeInfo, ChangeSet, ChangeType } from './ChangeInfo';
import { PackageGroups } from './BeachballPackageInfo';
import { VersionGroupOptions } from './BeachballOptions';
import { PackageInfo, PackageInfos } from 'workspace-tools';
import { Immutable } from './Immutable';

/** Versioning-related parts of package info (plus the name and path for convenience) */
export type PackageVersionInfo = Pick<
  PackageInfo,
  'packageJsonPath' | 'name' | 'version' | 'dependencies' | 'devDependencies' | 'peerDependencies'
>;

/** Mapping from package name to versioning-related parts of package info (plus the name and path for convenience) */
export type PackageVersionInfos = {
  [pkgName: string]: PackageVersionInfo;
};

export type BumpInfo = {
  changes: ChangeSet;
  // packageInfos: BeachballPackageInfos;
  // options: BetterOptions;
  /**
   * Copy of package info which will be MODIFIED by bump utilities.
   * TODO: figure out which props are actually used and include only those
   */
  // updatedPackageInfos: PackageInfos;
  updatedPackageInfos: PackageVersionInfos;
  // OMIT - mutated after creation
  // packageChangeTypes: { [pkgName: string]: ChangeInfo };
  // packageGroups: Immutable<PackageGroups>;
  // groupOptions: Immutable<{ [grp: string]: VersionGroupOptions }>;
  /**
   * Mapping from pacakge name to
   * Dependents for all packages.
   * Example: "BigApp" deps on "SomeUtil", "BigApp" would be the dependent.
   */
  dependents: Immutable<{ [pkgName: string]: string[] }>;
  dependentChangeTypes: { [pkgName: string]: ChangeType };
  // OMIT -- mutated after creation
  // dependentChangeInfos: ChangeInfo[];
  // OMIT -- mutated after creation
  // modifiedPackages: Set<string>;
  // OMIT -- mutated after creation
  // newPackages?: Set<string>;
  /**
   * If bumping is limited to a certain set of packages (`scope` option), includes only those package names.
   * Otherwise includes all package names.
   */
  scopedPackages: Set<string>;
};
