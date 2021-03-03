import fs from 'fs-extra';
import path from 'path';
import * as tmp from 'tmp';
import { BeachballPackageInfo } from '../types/BeachballPackageInfo';

export const testTag = 'testbeachballtag';

const testPackage = {
  name: 'testbeachballpackage',
  version: '0.6.0',
};

// Create a test package.json in a temporary location for use in tests.
var tmpPackageFile = path.join(tmp.dirSync().name, 'package.json');

fs.writeJSONSync(tmpPackageFile, testPackage, { spaces: 2 });

export const testPackageInfo: BeachballPackageInfo = {
  name: testPackage.name,
  packageJsonPath: tmpPackageFile,
  version: testPackage.version,
  private: false,
  combinedOptions: {
    gitTags: true,
    tag: testTag,
    defaultNpmTag: 'latest',
    disallowedChangeTypes: [],
  },
  packageOptions: {
    gitTags: true,
    tag: testTag,
    defaultNpmTag: 'latest',
    disallowedChangeTypes: [],
  },
};
