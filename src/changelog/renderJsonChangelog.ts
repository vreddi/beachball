import { generateTag } from '../tag';
import { PackageChangelog, ChangelogJson, ChangelogJsonEntry } from '../types/ChangeLog';
import { Immutable } from '../types/Immutable';

export function renderJsonChangelog(
  changelog: Immutable<PackageChangelog>,
  previousChangelog: Immutable<ChangelogJson> | undefined
) {
  const newEntry: Immutable<ChangelogJsonEntry> = {
    date: changelog.date.toUTCString(),
    tag: generateTag(changelog.name, changelog.version),
    version: changelog.version,
    comments: changelog.comments,
  };
  const result: Immutable<ChangelogJson> = {
    name: changelog.name,
    entries: [...(previousChangelog?.entries || []), newEntry],
  };
  return result;
}
