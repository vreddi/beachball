import { BeachballOptions, BetterOptions } from '../types/BeachballOptions';

export function resolveOption<OptionName extends keyof BeachballOptions>(
  option: OptionName,
  rawOptions: BetterOptions
) {
  const optionTypes: (keyof BetterOptions)[] = ['cliOptions', 'packageOptions', 'repoOptions', 'defaultOptions'];
  for (const optionType of optionTypes) {
    if ((rawOptions[optionType] as Object).hasOwnProperty(option)) {
      return (rawOptions[optionType] as any)[option];
    }
  }
  return undefined;
}
