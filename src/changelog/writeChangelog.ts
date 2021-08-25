import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import { ChangeInfo, ChangeSet } from '../types/ChangeInfo';
import { PackageVersionInfo, PackageVersionInfos } from '../types/BumpInfo';
import { getPackageChangelogs } from './getPackageChangelogs';
import { renderChangelog } from './renderChangelog';
import { renderJsonChangelog } from './renderJsonChangelog';
import { BeachballOptions } from '../types/BeachballOptions';
import { isPathIncluded } from '../monorepo/utils';
import { PackageChangelog, ChangelogJson } from '../types/ChangeLog';
import { mergeChangelogs } from './mergeChangelogs';
import { Immutable } from '../types/Immutable';

export async function writeChangelog(
  options: Immutable<BeachballOptions>,
  changeSet: Immutable<ChangeSet>,
  dependentChangeInfos: Immutable<ChangeInfo[]>,
  updatedPackageInfos: Immutable<PackageVersionInfos>
): Promise<void> {
  const groupedChangelogPaths = await writeGroupedChangelog(
    options,
    changeSet,
    dependentChangeInfos,
    updatedPackageInfos
  );
  const groupedChangelogPathSet = new Set(groupedChangelogPaths);

  const changelogs = getPackageChangelogs(changeSet, dependentChangeInfos, updatedPackageInfos);
  // Use a standard for loop here to prevent potentially firing off multiple network requests at once
  // (in case any custom renderers have network requests)
  for (const pkg of Object.keys(changelogs)) {
    const packagePath = path.dirname(updatedPackageInfos[pkg].packageJsonPath);
    if (groupedChangelogPathSet?.has(packagePath)) {
      console.log(`Changelog for ${pkg} has been written as a group here: ${packagePath}`);
    } else {
      await writeChangelogFiles(options, changelogs[pkg], packagePath, false);
    }
  }
}

async function writeGroupedChangelog(
  options: Immutable<BeachballOptions>,
  changeSet: Immutable<ChangeSet>,
  dependentChangeInfos: Immutable<ChangeInfo[]>,
  updatedPackageInfos: Immutable<PackageVersionInfos>
): Promise<string[]> {
  const { changelog, path: cwd } = options;
  if (!changelog) {
    return [];
  }

  const { groups: changelogGroups } = changelog;
  if (!changelogGroups || changelogGroups.length < 1) {
    return [];
  }

  const changelogs = getPackageChangelogs(changeSet, dependentChangeInfos, updatedPackageInfos);
  const groupedChangelogs: {
    [path: string]: Readonly<{
      changelogs: Immutable<PackageChangelog>[];
      masterPackage: Immutable<PackageVersionInfo>;
    }>;
  } = {};

  for (const pkg in changelogs) {
    const packagePath = path.dirname(updatedPackageInfos[pkg].packageJsonPath);
    const relativePath = path.relative(cwd, packagePath);
    for (const group of changelogGroups) {
      const { changelogPath, masterPackageName } = group;
      const masterPackage = updatedPackageInfos[masterPackageName];
      if (!masterPackage) {
        console.warn(`master package ${masterPackageName} does not exist.`);
        continue;
      }
      if (!fs.existsSync(changelogPath)) {
        console.warn(`changelog path ${changelogPath} does not exist.`);
        continue;
      }

      const isInGroup = isPathIncluded(relativePath, group.include, group.exclude);
      if (isInGroup) {
        if (!groupedChangelogs[changelogPath]) {
          groupedChangelogs[changelogPath] = {
            changelogs: [],
            masterPackage,
          };
        }

        groupedChangelogs[changelogPath].changelogs.push(changelogs[pkg]);
      }
    }
  }

  const changelogAbsolutePaths: string[] = [];
  for (const changelogPath in groupedChangelogs) {
    const { masterPackage, changelogs } = groupedChangelogs[changelogPath];
    const groupedChangelog = mergeChangelogs(changelogs, masterPackage.name, masterPackage.version);
    if (groupedChangelog) {
      await writeChangelogFiles(options, groupedChangelog, changelogPath, true);
      changelogAbsolutePaths.push(path.resolve(changelogPath));
    }
  }

  return changelogAbsolutePaths;
}

async function writeChangelogFiles(
  options: Immutable<BeachballOptions>,
  newVersionChangelog: Immutable<PackageChangelog>,
  changelogPath: string,
  isGrouped: boolean
): Promise<void> {
  const { changelog } = options;

  let previousJson: Immutable<ChangelogJson> | undefined;

  // Update CHANGELOG.json
  const changelogJsonFile = path.join(changelogPath, 'CHANGELOG.json');
  try {
    previousJson = fs.existsSync(changelogJsonFile) ? fs.readJSONSync(changelogJsonFile) : undefined;
  } catch (e) {
    console.warn('CHANGELOG.json is invalid:', e);
  }
  try {
    const nextJson = renderJsonChangelog(newVersionChangelog, previousJson);
    fs.writeJSONSync(changelogJsonFile, nextJson, { spaces: 2 });
  } catch (e) {
    console.warn('Problem writing to CHANGELOG.json:', e);
  }

  // Update CHANGELOG.md
  if (
    newVersionChangelog.comments.major ||
    newVersionChangelog.comments.minor ||
    newVersionChangelog.comments.patch ||
    newVersionChangelog.comments.prerelease
  ) {
    const changelogFile = path.join(changelogPath, 'CHANGELOG.md');
    const previousContent = fs.existsSync(changelogFile) ? fs.readFileSync(changelogFile).toString() : '';

    const newChangelog = await renderChangelog({
      previousJson,
      previousContent,
      newVersionChangelog,
      isGrouped,
      changelogOptions: changelog || {},
    });

    fs.writeFileSync(changelogFile, newChangelog);
  }
}
