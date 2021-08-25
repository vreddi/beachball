import { BeachballOptions2 } from '../options/BeachballOptions2';
import { getScopedPackages } from '../monorepo/getScopedPackages';
import { listPackageVersionsByTag } from '../packageManager/listPackageVersions';
import semver from 'semver';
import { setDependentVersions } from '../bump/setDependentVersions';
import { writePackageJson } from '../bump/performBump';

export async function sync(options: BeachballOptions2) {
  const packageInfos = options.getBasicPackageInfos(true /*copy*/);
  const scopedPackages = new Set(getScopedPackages(options));

  const infos = new Map(Object.entries(packageInfos).filter(([pkg, info]) => !info.private && scopedPackages.has(pkg)));
  const publishedVersions = await listPackageVersionsByTag(
    [...infos.values()],
    options.registry,
    options.tag,
    options.token
  );

  const modifiedPackages = new Set<string>();

  for (const [pkg, info] of infos.entries()) {
    if (publishedVersions[pkg]) {
      const publishedVersion = publishedVersions[pkg];

      if (publishedVersion && (options.forceVersions || semver.lt(info.version, publishedVersion))) {
        console.log(
          `There is a newer version of "${pkg}@${info.version}". Syncing to the published version ${publishedVersion}`
        );

        packageInfos[pkg].version = publishedVersion;
        modifiedPackages.add(pkg);
      }
    }
  }

  const dependentModifiedPackages = setDependentVersions(packageInfos, scopedPackages);
  dependentModifiedPackages.forEach(pkg => modifiedPackages.add(pkg));

  writePackageJson(modifiedPackages, packageInfos);
}
