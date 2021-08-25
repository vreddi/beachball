import { BeachballOptions2 } from '../options/BeachballOptions2';
import path from 'path';
import { isPathIncluded } from './utils';

/**
 * If a `scope` option was provided, returns the packages that satisfy the scope.
 * Otherwise returns all packages.
 */
export function getScopedPackages(options: BeachballOptions2): Set<string> {
  const packageInfos = options.getBasicPackageInfos();
  const scope = options.resolve('scope');
  if (!scope) {
    return new Set(Object.keys(packageInfos));
  }

  let includeScopes = scope.filter(s => !s.startsWith('!'));
  includeScopes = includeScopes.length > 0 ? includeScopes : ['**/*', '', '*'];
  const excludeScopes = scope.filter(s => s.startsWith('!'));

  const scopedPackages = new Set<string>();

  for (let [pkgName, info] of Object.entries(packageInfos)) {
    const relativePath = path.relative(options.path, path.dirname(info.packageJsonPath));

    const shouldInclude = isPathIncluded(relativePath, includeScopes, excludeScopes);
    if (shouldInclude) {
      scopedPackages.add(pkgName);
    }
  }

  return new Set(scopedPackages);
}
