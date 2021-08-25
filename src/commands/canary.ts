import semver from 'semver';
import { gatherBumpInfo } from '../bump/gatherBumpInfo';
import { performBump } from '../bump/performBump';
import { setDependentVersions } from '../bump/setDependentVersions';
import { BeachballOptions2 } from '../options/BeachballOptions2';
import { listPackageVersions } from '../packageManager/listPackageVersions';
import { publishToRegistry } from '../publish/publishToRegistry';

export async function canary(options: BeachballOptions2) {
  const { canaryName, registry } = options;

  const oldPackageInfo = options.getBasicPackageInfos();

  const bumpInfo = gatherBumpInfo(options);

  options.addOverride('keepChangeFiles', true);
  options.addOverride('generateChangelog', false);
  options.addOverride('tag', canaryName);

  if (options.all) {
    for (const pkg of Object.keys(oldPackageInfo)) {
      bumpInfo.modifiedPackages.add(pkg);
    }
  }

  const packageVersions = await listPackageVersions([...bumpInfo.modifiedPackages], registry);

  for (const pkg of bumpInfo.modifiedPackages) {
    let newVersion = oldPackageInfo[pkg].version;

    do {
      newVersion = semver.inc(newVersion, 'prerelease', canaryName);
    } while (packageVersions[pkg].includes(newVersion));

    bumpInfo.updatedPackageInfos[pkg].version = newVersion;
  }

  setDependentVersions(bumpInfo.updatedPackageInfos, bumpInfo.scopedPackages);

  await performBump(bumpInfo, options);

  await publishToRegistry(bumpInfo, options);
}
