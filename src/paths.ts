import path from 'path';
import { findGitRoot, getWorkspaceRoot } from 'workspace-tools';

export function findProjectRoot(cwd: string): string | null {
  let workspaceRoot: string | null | undefined;
  try {
    workspaceRoot = getWorkspaceRoot(cwd);
  } catch {}

  return workspaceRoot || findGitRoot(cwd);
}

export function getChangePath(cwd: string) {
  const root = findProjectRoot(cwd);

  if (!root) {
    throw new Error(`${cwd} does not appear to be part of a workspace or git repo`)l
  }

  return path.join(root, 'change');
}

