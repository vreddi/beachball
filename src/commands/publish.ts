import { gatherBumpInfo } from '../bump/gatherBumpInfo';
import { BeachballOptions2 } from '../options/BeachballOptions2';
import { gitFailFast, getBranchName, getCurrentHash } from 'workspace-tools';
import prompts from 'prompts';
import { getPackageChangeTypes } from '../changefile/getPackageChangeTypes';
import { readChangeFiles } from '../changefile/readChangeFiles';
import { bumpAndPush } from '../publish/bumpAndPush';
import { publishToRegistry } from '../publish/publishToRegistry';
import { getNewPackages } from '../publish/getNewPackages';

export async function publish(options: BeachballOptions2) {
  const { path: cwd, branch, registry, tag, bump, publish, push, yes } = options;
  // First, validate that we have changes to publish
  const changes = readChangeFiles(options);
  const packageChangeTypes = getPackageChangeTypes(changes);
  if (Object.keys(packageChangeTypes).length === 0) {
    console.log('Nothing to bump, skipping publish!');
    return;
  }
  // Collate the changes per package
  const currentBranch = getBranchName(cwd);
  const currentHash = getCurrentHash(cwd);
  console.log(`Publishing with the following configuration:

  registry: ${registry}

  current branch: ${currentBranch}
  current hash: ${currentHash}
  target branch: ${branch}
  tag: ${tag}

  bumps versions: ${bump ? 'yes' : 'no'}
  publishes to npm registry: ${publish ? 'yes' : 'no'}
  pushes to remote git repo: ${bump && push && branch ? 'yes' : 'no'}

`);
  if (!yes) {
    const response = await prompts({
      type: 'confirm',
      name: 'yes',
      message: 'Is everything correct (use the --yes or -y arg to skip this prompt)?',
    });
    if (!response.yes) {
      return;
    }
  }
  // checkout publish branch
  const publishBranch = 'publish_' + String(new Date().getTime());

  console.log(`creating temporary publish branch ${publishBranch}`);
  gitFailFast(['checkout', '-b', publishBranch], { cwd });

  if (bump) {
    console.log('Bumping version for npm publish');
  }

  const bumpInfo = gatherBumpInfo(options);
  let newPackages: Set<string> | undefined;

  if (options.new) {
    newPackages = new Set<string>(await getNewPackages(bumpInfo, registry));
  }

  // Step 1. Bump + npm publish
  // npm / yarn publish
  if (publish) {
    await publishToRegistry(bumpInfo, options);
  } else {
    console.log('Skipping publish');
  }

  // Step 2.
  // - reset, fetch latest from origin/master (to ensure less chance of conflict), then bump again + commit
  if (bump && branch && push) {
    await bumpAndPush(bumpInfo, publishBranch, options);
  } else {
    console.log('Skipping git push and tagging');
  }

  // Step 3.
  // Clean up: switch back to current branch, delete publish branch

  const revParseSuccessful = currentBranch || currentHash;
  const inBranch = currentBranch && currentBranch !== 'HEAD';
  const hasHash = currentHash !== null;
  if (inBranch) {
    console.log(`git checkout ${currentBranch}`);
    gitFailFast(['checkout', currentBranch!], { cwd });
  } else if (hasHash) {
    console.log(`Looks like the repo was detached from a branch`);
    console.log(`git checkout ${currentHash}`);
    gitFailFast(['checkout', currentHash!], { cwd });
  }

  if (revParseSuccessful) {
    console.log(`deleting temporary publish branch ${publishBranch}`);
    gitFailFast(['branch', '-D', publishBranch], { cwd });
  }
}
