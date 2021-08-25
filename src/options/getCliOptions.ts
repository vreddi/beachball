import parser from 'yargs-parser';
import { CliOptions } from '../types/BeachballOptions';
import { getDefaultRemoteBranch } from 'workspace-tools';

let cachedCliOptions: CliOptions;

export function getCliOptions(argv: string[], root: string): CliOptions {
  // Special case caching to process.argv which should be immutable
  if (argv === process.argv) {
    if (!cachedCliOptions) {
      cachedCliOptions = getCliOptionsUncached(process.argv, root);
    }
    return cachedCliOptions;
  } else {
    return getCliOptionsUncached(argv, root);
  }
}

function getCliOptionsUncached(argv: string[], root: string): CliOptions {
  // Be careful not to mutate the input argv
  const trimmedArgv = [...argv].splice(2);

  const args = parser(trimmedArgv, {
    string: ['branch', 'tag', 'message', 'package', 'since', 'dependent-change-type', 'config'],
    array: ['scope', 'disallowed-change-types'],
    boolean: ['git-tags', 'keep-change-files', 'force', 'disallow-deleted-change-files', 'no-commit'],
    alias: {
      branch: ['b'],
      config: ['c'],
      tag: ['t'],
      registry: ['r'],
      message: ['m'],
      token: ['n'],
      help: ['h', '?'],
      yes: ['y'],
      package: ['p'],
      version: ['v'],
    },
  });

  const { _, ...restArgs } = args;
  const cliOptions: CliOptions = {
    command: 'change',
    ...(_.length > 0 && { command: _[0] }),
    ...(restArgs as any),
    fromRef: args.since,
    keepChangeFiles: args['keep-change-files'],
    disallowDeletedChangeFiles: args['disallow-deleted-change-files'],
    forceVersions: args.force,
    configPath: args.config,
  };

  const disallowedChangeTypesArgs = args['disallowed-change-types'];
  if (disallowedChangeTypesArgs) {
    cliOptions.disallowedChangeTypes = disallowedChangeTypesArgs;
  }

  if (args.branch) {
    try {
      cliOptions.branch =
        args.branch.indexOf('/') > -1 ? args.branch : getDefaultRemoteBranch(args.branch, root, true /*strict*/);
    } catch (err) {
      console.error('Could not determine which branch to compare against:');
      console.error(err);
      process.exit(1);
    }
  }

  return cliOptions;
}
