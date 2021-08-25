import { unlinkChangeFiles } from '../changefile/unlinkChangeFiles';
import { writeChangelog } from '../changelog/writeChangelog';
import fs from 'fs-extra';
import { BumpInfo, PackageVersionInfos } from '../types/BumpInfo';
import { BeachballOptions } from '../types/BeachballOptions';
import { PackageDeps } from 'workspace-tools';
import { Immutable } from '../types/Immutable';

export function writePackageJson(
  modifiedPackages: ReadonlySet<string>,
  packageInfos: Immutable<PackageVersionInfos>
) {
  for (const pkgName of modifiedPackages) {
    const info = packageInfos[pkgName];
    const packageJson = fs.readJSONSync(info.packageJsonPath);

    packageJson.version = info.version;

    (['dependencies', 'devDependencies', 'peerDependencies'] as const).forEach(depKind => {
      // updatedDeps contains all of the dependencies in the bump info since the beginning of a build job
      const updatedDepsVersions: PackageDeps | undefined = info[depKind];
      if (updatedDepsVersions) {
        // to be cautious, only update internal && modifiedPackages, since some other dependency
        // changes could have occurred since the beginning of the build job and the next merge step
        // would overwrite those incorrectly!
        const modifiedDeps = Object.keys(updatedDepsVersions).filter(dep => modifiedPackages.has(dep));

        for (const dep of modifiedDeps) {
          if (packageJson[depKind] && packageJson[depKind][dep]) {
            packageJson[depKind][dep] = updatedDepsVersions[dep];
          }
        }
      }
    });

    fs.writeJSONSync(info.packageJsonPath, packageJson, { spaces: 2 });
  }
}

/**
 * Performs the bump, writes to the file system
 *
 * deletes change files, update package.json, and changelogs
 */
export async function performBump(bumpInfo: Immutable<BumpInfo>, options: Immutable<BeachballOptions>) {
  const { modifiedPackages, updatedPackageInfos, changes, dependentChangeInfos } = bumpInfo;

  writePackageJson(modifiedPackages, updatedPackageInfos);

  if (options.generateChangelog) {
    // Generate changelog
    await writeChangelog(options, changes, dependentChangeInfos, updatedPackageInfos);
  }

  if (!options.keepChangeFiles) {
    // Unlink changelogs
    unlinkChangeFiles(changes, updatedPackageInfos, options.path);
  }
}
