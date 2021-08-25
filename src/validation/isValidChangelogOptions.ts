import { ChangelogOptions, ChangelogGroupOptions } from '../types/ChangelogOptions';
import { Immutable } from '../types/Immutable';

export function isValidChangelogOptions(options: Immutable<ChangelogOptions>): boolean {
  if (options.groups) {
    if (!isValidChangelogGroupOptions(options.groups)) {
      return false;
    }
  }
  return true;
}

function isValidChangelogGroupOptions(groupOptions: Immutable<ChangelogGroupOptions[]>): boolean {
  for (const options of groupOptions) {
    if (!options.changelogPath) {
      console.log('changelog group options cannot contain empty changelogPath.');
      return false;
    }

    if (!options.masterPackageName) {
      console.log('changelog group options cannot contain empty masterPackageName.');
      return false;
    }

    if (!options.include) {
      console.log('changelog group options cannot contain empty include.');
      return false;
    }
  }

  return true;
}
