import { Command } from 'commander';
import { convertCommand } from './commands/convert.js';
import { getVersion } from './utils/version.js';
import { banner } from './utils/banner.js';

const program = new Command();

program
  .name('txtli')
  .description('Convert folder contents to text for LLMs')
  .version(getVersion(), '-v, --version', 'Output the version number')
  .helpOption('-h, --help', 'Display help for command')
  .hook('preAction', (thisCommand) => {
    if (!thisCommand.args.includes('-v') && !thisCommand.args.includes('--version')) {
      console.log(banner);
    }
  });

program
  .argument('[folder]', 'Folder path to convert', '.')
  .option('-i, --interactive', 'Interactive mode to select files')
  .action(convertCommand);

program.parse();
