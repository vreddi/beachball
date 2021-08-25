import { bump } from './commands/bump';
import { canary } from './commands/canary';
import { change } from './commands/change';
import { init } from './commands/init';
import { publish } from './commands/publish';
import { sync } from './commands/sync';

import { showVersion, showHelp } from './help';
import { BeachballOptions2 } from './options/BeachballOptions2';
import { getCliOptions } from './options/getCliOptions';
import { findProjectRoot } from './paths';
import { validate } from './validation/validate';

(async () => {
  const root = findProjectRoot(process.cwd()) || process.cwd();
  const cliOptions = getCliOptions(process.argv, root);
  const options = new BeachballOptions2(process.argv, root);

  if (cliOptions.help) {
    showHelp();
    process.exit(0);
  }

  if (cliOptions.version) {
    showVersion();
    process.exit(0);
  }

  // Run the commands
  switch (cliOptions.command) {
    case 'check':
      validate(options);
      console.log('No change files are needed');
      break;

    case 'publish':
      validate(options, { allowFetching: false });

      // set a default publish message
      if (!options.message) {
        options.addOverride('message', 'applying package updates');
      }
      await publish(options);
      break;

    case 'bump':
      validate(options);
      await bump(options);
      break;

    case 'canary':
      validate(options, { allowFetching: false });
      await canary(options);
      break;

    case 'init':
      await init(options);
      break;

    case 'sync':
      sync(options);
      break;

    default:
      const { isChangeNeeded } = validate(options, { allowMissingChangeFiles: true });

      if (!isChangeNeeded && !options.package) {
        console.log('No change files are needed');
        return;
      }

      change(options);

      break;
  }
})().catch(e => {
  showVersion();
  console.error('An error has been detected while running beachball!');
  console.error(e);

  process.exit(1);
});
