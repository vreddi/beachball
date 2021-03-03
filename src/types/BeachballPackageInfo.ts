import { PackageDeps, PackageInfo, PackageInfos } from 'workspace-tools';
import { PackageOptions, BeachballOptions } from './BeachballOptions';
import { ChangeType } from './ChangeInfo';

// export interface PackageDeps {
//   [dep: string]: string;
// }

export interface PackageJson {
  name: string;
  version: string;
  main?: string;
  dependencies?: PackageDeps;
  devDependencies?: PackageDeps;
  peerDependencies?: PackageDeps;
  private?: boolean;
  beachball?: BeachballOptions;
}

/** Package info with additional beachball properties, including combined options */
export interface BeachballPackageInfo extends PackageInfo {
  private: boolean;

  // /** options that are combined from the root configuration */
  // combinedOptions: PackageOptions;

  /** options that are SPECIFIC to the package from its configuration file (might be nothing) */
  packageOptions: Partial<PackageOptions>;
  group?: string;
}

/** Package infos with additional beachball properties, including combined options */
export type BeachballPackageInfos = PackageInfos<BeachballPackageInfo>;

export interface PackageGroupsInfo {
  packageNames: string[];
  disallowedChangeTypes: ChangeType[] | null;
}

export type PackageGroups = { [groupName: string]: PackageGroupsInfo };
