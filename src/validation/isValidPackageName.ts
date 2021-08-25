import { getPackageInfos as getBasicPackageInfos } from 'workspace-tools';

export function isValidPackageName(pkg: string, cwd: string) {
  const allPackages = getBasicPackageInfos(cwd);
  return !!allPackages[pkg];
}
