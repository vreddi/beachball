import { BeachballOptions2 } from '../options/BeachballOptions2';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import * as os from 'os';

export async function init(options: BeachballOptions2) {
  const packageJsonFilePath = path.join(options.path, 'package.json');
  const npmCmd = path.join(path.dirname(process.execPath), os.platform() === 'win32' ? 'npm.cmd' : 'npm');

  if (fs.existsSync(packageJsonFilePath)) {
    const beachballInfo = JSON.parse(spawnSync(npmCmd, ['info', 'beachball', '--json']).stdout);
    const beachballVersion = beachballInfo['dist-tags'].latest;

    const packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf-8'));
    packageJson.devDependencies = packageJson.devDependencies ?? {};
    packageJson.devDependencies.beachball = beachballVersion;
    packageJson.scripts = packageJson.scripts ?? {};
    packageJson.scripts.checkchange = 'beachball check';
    packageJson.scripts.change = 'beachball change';
    packageJson.scripts.release = 'beachball publish';

    fs.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2));

    console.log(
      'beachball has been initialized, please run `yarn` or `npm install` to install beachball into your repo'
    );
  }
}
