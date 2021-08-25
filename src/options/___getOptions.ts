import { BeachballOptions, CliOptions, InferredOptions } from '../types/BeachballOptions';
import { getRepoOptions } from './getRepoOptions';
import { getDefaultOptions } from './getDefaultOptions';

/**
 * Gets all repo level options (default + root options + cli options)
 */
export function getOptions(cliOptions: CliOptions): BeachballOptions {
  return { ...getDefaultOptions(), ...getRepoOptions(cliOptions), ...cliOptions };
}
