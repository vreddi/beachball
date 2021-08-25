import _ from 'lodash';
import { getPackageInfos, PackageInfo, PackageInfos } from 'workspace-tools';
import { getPackageGroups } from '../monorepo/getPackageGroups';
import { BeachballOptions, CliOptions, PackageOptions, RepoHooks, RepoOptions } from '../types/BeachballOptions';
import { PackageGroups, PackageGroupInfo } from '../types/BeachballPackageInfo';
import { ChangeType } from '../types/ChangeInfo';
import { Immutable } from '../types/Immutable';
import { getCliOptions } from './getCliOptions';
import { getPackageOptions } from './getPackageOptions';
import { getRepoOptions } from './getRepoOptions';

const validPackageOptions = ['gitTags', 'disallowedChangeTypes', 'tag', 'defaultNpmTag', 'changeFilePrompt'] as const;
const validGroupOptions = ['disallowedChangeTypes'] as const;

export class BeachballOptions2 implements BeachballOptions {
  private readonly _root: string;
  private readonly _overrides: Partial<BeachballOptions>;
  private readonly _packageOverrides: { [packageName: string]: Partial<PackageOptions> } = {};
  private readonly _cliOptions: Immutable<CliOptions>;
  private readonly _cachedPackageOptions: { [packageName: string]: Partial<PackageOptions> };
  // private readonly _groupOptions: { [packageName: string]: Pick<VersionGroupOptions, 'disallowedChangeTypes'> };
  private readonly _repoOptions: Immutable<RepoOptions>;
  // private readonly _defaultOptions: Immutable<Partial<BeachballOptions>>;
  private _cachedGroupsOptionsByPackage: { [packageName: string]: Immutable<PackageGroupInfo> } | undefined;
  private _cachedPackageInfos: Immutable<PackageInfos> | undefined;
  private _cachedPackageGroups: Immutable<PackageGroups> | undefined;
  // private _cachedPackageOptions: { [packageName: string]: PackageOptions}

  constructor(argv: string[], root: string) {
    this._root = root;
    this._cliOptions = getCliOptions(argv, root);
    this._repoOptions = getRepoOptions(this._cliOptions);
    // this._defaultOptions = getDefaultOptions();
    this._overrides = {};
    this._cachedPackageOptions = {};
  }

  get all(): boolean {
    return !!this.resolve('all');
  }
  get branch(): string {
    return this.resolve('branch');
  }
  get message(): string | undefined {
    return this.resolve('message');
  }
  get path(): string {
    return this.resolve('path');
  }
  get registry(): string {
    return this.resolve('registry') || 'https://registry.npmjs.org/';
  }
  get gitTags(): boolean {
    return this.resolve('gitTags') ?? true;
  }
  get tag(): string | undefined {
    return this.resolve('tag');
  }
  get token(): string | undefined {
    return this.resolve('token');
  }
  get push(): boolean {
    return this.resolve('push') ?? true;
  }
  get publish(): boolean {
    return this.resolve('publish') ?? true;
  }
  get bumpDeps(): boolean {
    return this.resolve('bumpDeps') ?? true;
  }
  get fetch(): boolean {
    return this.resolve('fetch') ?? true;
  }
  get yes(): boolean | undefined {
    return this.resolve('yes');
  }
  get new(): boolean | undefined {
    return this.resolve('new');
  }
  get access(): 'public' | 'restricted' {
    return this.resolve('access') || 'restricted';
  }
  get package(): string | undefined {
    return this.resolve('package');
  }
  get changehint(): string {
    return this.resolve('changehint') || 'Run "beachball change" to create a change file';
  }
  get retries(): number {
    return this.resolve('retries') ?? 3;
  }
  get type(): ChangeType | undefined {
    return this.resolve('type');
  }
  get scope(): string[] | undefined {
    return this.resolve('scope') as string[] | undefined;
  }
  get timeout(): number | undefined {
    return this.resolve('timeout');
  }
  get fromRef(): string | undefined {
    return this.resolve('fromRef');
  }
  get keepChangeFiles(): boolean | undefined {
    return this.resolve('keepChangeFiles');
  }
  get bump(): boolean {
    return this.resolve('bump') ?? true;
  }
  get canaryName(): string {
    return this.resolve('canaryName') || 'canary';
  }
  get forceVersions(): boolean | undefined {
    return this.resolve('forceVersions');
  }
  get disallowedChangeTypes(): ChangeType[] | undefined {
    return this.resolve('disallowedChangeTypes') as ChangeType[] | undefined;
  }
  get dependentChangeType(): ChangeType | undefined {
    return this.resolve('dependentChangeType');
  }
  get disallowDeletedChangeFiles(): boolean | undefined {
    return this.resolve('disallowDeletedChangeFiles');
  }
  get prereleasePrefix(): string | undefined {
    return this.resolve('prereleasePrefix');
  }
  get configPath(): string | undefined {
    return this.resolve('configPath');
  }
  get commit(): boolean | undefined {
    return this.resolve('commit');
  }
  get defaultNpmTag(): string {
    return this.resolve('defaultNpmTag') || 'latest';
  }
  get generateChangelog(): boolean {
    return this.resolve('generateChangelog') ?? true;
  }
  get hooks(): RepoHooks | undefined {
    return this.resolve('hooks');
  }

  getForPackage<OptionName extends keyof PackageOptions>(
    option: OptionName,
    packageName: string
  ): Immutable<PackageOptions[OptionName]> {
    return this.resolve(option, packageName); // as Immutable<PackageOptions[OptionName]>;
  }

  /** Get a resolved option value */
  resolve<OptionName extends keyof BeachballOptions>(
    option: OptionName,
    packageName?: string
  ): Immutable<BeachballOptions[OptionName]> {
    const optionsToConsider = [
      this._overrides,
      this._cliOptions,
      packageName ? this._packageOverrides[packageName] : undefined,
      // delay loading these expensive things until needed
      packageName ? () => this._getPackageOptions(packageName) : undefined,
      packageName ? () => this.getGroupForPackage(packageName) : undefined,
      this._repoOptions,
      // this._defaultOptions,
    ];
    for (const optionsOrFunc of optionsToConsider) {
      if (optionsOrFunc) {
        const options = typeof optionsOrFunc === 'function' ? optionsOrFunc() : optionsOrFunc;
        if ((options as Object).hasOwnProperty(option)) {
          return (options as any)[option];
        }
      }
    }
    return undefined as any; // TODO: something else?
  }

  /** Override an option value (useful for testing) */
  addOverride<OptionName extends keyof BeachballOptions>(
    option: OptionName,
    value: BeachballOptions[OptionName]
  ): void {
    this._overrides[option] = value;
  }

  addPackageOverride<OptionName extends keyof PackageOptions>(
    packageName: string,
    option: OptionName,
    value: PackageOptions[OptionName]
  ): void {
    this._packageOverrides[packageName] = this._packageOverrides[packageName] || {};
    this._packageOverrides[packageName][option] = value;
  }

  getPackageInfo(packageName: string): Immutable<PackageInfo> | undefined;
  getPackageInfo(packageName: string, copy: true): PackageInfo | undefined;
  getPackageInfo(packageName: string, copy?: boolean): Immutable<PackageInfo> | undefined {
    const packageInfo = this.getBasicPackageInfos()[packageName];
    return copy ? _.cloneDeep(packageInfo) : packageInfo;
  }

  getBasicPackageInfos(): Immutable<PackageInfos>;
  getBasicPackageInfos(copy: true): PackageInfos;
  getBasicPackageInfos(copy?: boolean): Immutable<PackageInfos> {
    if (!this._cachedPackageInfos) {
      this._cachedPackageInfos = getPackageInfos(this.resolve('path'));
    }
    return copy ? _.cloneDeep(this._cachedPackageInfos) : this._cachedPackageInfos;
  }

  getPackageGroups(): Immutable<PackageGroups> | undefined {
    if (this._repoOptions.groups && !this._cachedPackageGroups) {
      this._cachedPackageGroups = getPackageGroups(this.getBasicPackageInfos(), this._root, this._repoOptions.groups);
    }
    return this._cachedPackageGroups;
  }

  getGroupForPackage(packageName: string): Immutable<PackageGroupInfo> | undefined {
    const packageGroups = this.getPackageGroups();
    if (packageGroups) {
      if (!this._cachedGroupsOptionsByPackage) {
        this._cachedGroupsOptionsByPackage = {};
        for (const group of Object.values(packageGroups)) {
          for (const packageName of group.packageNames) {
            this._cachedGroupsOptionsByPackage[packageName] = group;
          }
        }
      }
    }
    return this._cachedGroupsOptionsByPackage?.[packageName];
  }

  private _getPackageOptions(packageName: string, packagePath?: string): Partial<PackageOptions> {
    if (!this._cachedPackageOptions[packageName]) {
      if (!packagePath) {
        const packageInfo = this.getBasicPackageInfos()[packageName];
        if (!packageInfo) {
          console.error(`Could not find package.json for ${packageName}`);
          process.exit(1);
        }
        packagePath = packageInfo.packageJsonPath;
      }
      this._cachedPackageOptions[packageName] = getPackageOptions(packagePath);
    }
    return this._cachedPackageOptions[packageName];
  }
}

// export function resolveOption<OptionName extends keyof BeachballOptions>(option: OptionName, rawOptions: BetterOptions) {
//   const optionTypes: (keyof BetterOptions)[] = ['cliOptions', 'packageOptions', 'repoOptions', 'defaultOptions'];
//   for (const optionType of optionTypes) {
//     if ((rawOptions[optionType] as Object).hasOwnProperty(option)) {
//       return (rawOptions[optionType] as any)[option];
//     }
//   }
//   return undefined;
// }
