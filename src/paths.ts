import path from 'path';
import fs from 'fs-extra';
import { getWorkspaceRoot } from 'workspace-tools';

/**
 * Starting from `cwd`, searches up the directory hierarchy for `pathName`
 */
export function searchUp(pathName: string, cwd: string) {
  const root = path.parse(cwd).root;

  let found = false;

  while (!found && cwd !== root) {
    if (fs.existsSync(path.join(cwd, pathName))) {
      found = true;
      break;
    }

    cwd = path.dirname(cwd);
  }

  if (found) {
    return cwd;
  }

  return null;
}

export function findGitRoot(cwd: string) {
  return searchUp('.git', cwd);
}

export function findProjectRoot(cwd: string): string {
  let workspaceRoot: string | null | undefined;
  try {
    workspaceRoot = getWorkspaceRoot(cwd);
  } catch {}

  workspaceRoot = workspaceRoot || findGitRoot(cwd);

  if (!workspaceRoot) {
    throw new Error(`Could not find workspace or git root relative to ${cwd}`);
  }
  return workspaceRoot;
}

export function findPackageRoot(cwd: string) {
  return searchUp('package.json', cwd);
}

export function getChangePath(cwd: string) {
  return path.join(findProjectRoot(cwd), 'change');
}

export function isChildOf(child: string, parent: string) {
  const relativePath = path.relative(child, parent);
  return /^[.\/\\]+$/.test(relativePath);
}
