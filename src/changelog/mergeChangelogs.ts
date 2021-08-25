import _ from 'lodash';
import { PackageChangelog } from '../types/ChangeLog';
import { generateTag } from '../tag';
import { ChangeType } from '../types/ChangeInfo';
import { Immutable } from '../types/Immutable';

/**
 * Merge multiple PackageChangelog into one.
 * `name`, `date` and `version` will be using the values from master changelog. `comments` are merged.
 */
export function mergeChangelogs(
  changelogs: Immutable<PackageChangelog[]>,
  masterPackageName: string,
  masterPackageVersion: string
): Immutable<PackageChangelog> | undefined {
  if (changelogs.length < 1) {
    return undefined;
  }

  const result: PackageChangelog = {
    name: masterPackageName,
    version: masterPackageVersion,
    tag: generateTag(masterPackageName, masterPackageVersion),
    date: new Date(),
    comments: {},
  };

  changelogs.forEach(changelog => {
    (Object.keys(changelog.comments) as ChangeType[]).forEach(changeType => {
      if (changelog.comments[changeType]) {
        result.comments[changeType] = (result.comments[changeType] || []).concat(changelog.comments[changeType]!);
      }
    });
  });

  return result;
}
