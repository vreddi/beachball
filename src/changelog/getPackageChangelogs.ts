import { ChangeInfo, ChangeSet } from '../types/ChangeInfo';
import { PackageVersionInfos } from '../types/BumpInfo';
import { PackageChangelog } from '../types/ChangeLog';
import { generateTag } from '../tag';
import { Immutable } from '../types/Immutable';

export function getPackageChangelogs(
  changeSet: Immutable<ChangeSet>,
  dependentChangeInfos: Immutable<ChangeInfo[]>,
  updatedPackageInfos: Immutable<PackageVersionInfos>
) {
  const changeInfos = Array.from(changeSet.values()).concat(dependentChangeInfos);
  const changelogs: {
    [pkgName: string]: PackageChangelog;
  } = {};
  for (let change of changeInfos) {
    const { packageName } = change;
    if (!changelogs[packageName]) {
      const version = updatedPackageInfos[packageName].version;
      changelogs[packageName] = {
        name: packageName,
        version,
        tag: generateTag(packageName, version),
        date: new Date(),
        comments: {},
      };
    }

    changelogs[packageName].comments = changelogs[packageName].comments || {};
    changelogs[packageName].comments[change.type] = changelogs[packageName].comments[change.type] || [];
    changelogs[packageName].comments[change.type]!.push({
      comment: change.comment,
      author: change.email,
      commit: change.commit,
      package: packageName,
    });
  }
  return changelogs as Immutable<typeof changelogs>;
}
