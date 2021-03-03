import { getDefaultRemoteBranch, PackageInfos } from 'workspace-tools';
import {
  BeachballOptions,
  CliOptions,
  PackageOptions,
  RepoOptions,
  VersionGroupOptions,
} from '../types/BeachballOptions';
import { getCliOptions } from './getCliOptions';
import { getDefaultOptions } from './getDefaultOptions';
import { getRootOptions } from './getRootOptions';

const validPackageOptions = ['gitTags', 'disallowedChangeTypes', 'tag', 'defaultNpmTag', 'changeFilePrompt'] as const;
const validGroupOptions = ['disallowedChangeTypes'] as const;

export class BeachballOptions2 {
  private readonly _overrides: Partial<BeachballOptions>;
  private readonly _cliOptions: Readonly<CliOptions>;
  private readonly _repoOptions: Readonly<RepoOptions>;
  private readonly _cachedGroupOptions: { [packageName: string]: Pick<VersionGroupOptions, 'disallowedChangeTypes'> };
  private readonly _cachedPackageOptions: { [packageName: string]: PackageOptions };
  private readonly _defaultOptions: Readonly<Partial<BeachballOptions>>;
  private _packageInfos: PackageInfos | undefined;

  constructor(argv: string[]) {
    this._cliOptions = getCliOptions(argv);
    this._repoOptions = getRootOptions(this._cliOptions);
    this._defaultOptions = getDefaultOptions();
    this._overrides = {};
    this._cachedGroupOptions = {};
    this._cachedPackageOptions = {};
  }

  getOption<OptionName extends keyof BeachballOptions>(
    option: OptionName,
    packageName?: string
  ): BeachballOptions[OptionName] {
    const optionsToConsider = [
      this._cliOptions,
      ...(packageName && validPackageOptions.includes(option as any) ? [this._groupOptions] : []),
      ...(packageName && validGroupOptions.includes(option as any) ? [this._packageOptions] : []),
    ];
    for (const optionGroup of [optionTypes]) {
      if ((rawOptions[optionType] as Object).hasOwnProperty(option)) {
        return (rawOptions[optionType] as any)[option];
      }
    }
  }

  private _getPackageOptions();
}

function checkForOption(option: string, optionGroup: any) {
  if ((optionGroup as Object).hasOwnProperty(option)) {
    return optionGroup[option];
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
