import { resolve } from 'path';
import { existsSync } from 'fs';
import * as clack from '@clack/prompts';
import clipboardy from 'clipboardy';
import { getAllFiles, formatFilesAsText, type FileInfo } from '../utils/fileReader.js';

interface ConvertOptions {
  interactive?: boolean;
}

export async function convertCommand(folder: string, options: ConvertOptions) {
  const folderPath = resolve(folder);

  if (!existsSync(folderPath)) {
    clack.log.error(`Folder not found: ${folderPath}`);
    process.exit(1);
  }

  clack.intro('📁 Scanning folder...');

  let allFiles: FileInfo[];
  try {
    allFiles = getAllFiles(folderPath);
  } catch (err) {
    clack.log.error(err instanceof Error ? err.message : 'Failed to read folder');
    process.exit(1);
  }

  if (allFiles.length === 0) {
    clack.log.warn('No files found in the folder');
    process.exit(0);
  }

  let selectedFiles = allFiles;

  if (options.interactive) {
    const textFiles = allFiles.filter(f => f.isText);
    const binaryFiles = allFiles.filter(f => !f.isText);

    clack.log.info(`Found ${textFiles.length} text files and ${binaryFiles.length} binary files`);

    const directories = [...new Set(allFiles.map(f => f.directory))].sort();
    const extensions = [...new Set(allFiles.map(f => f.extension))].sort();

    const excludeDirs = await clack.multiselect({
      message: 'Exclude directories (select to exclude):',
      options: directories.map(dir => ({ value: dir, label: dir })),
      required: false,
    });

    if (clack.isCancel(excludeDirs)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }

    const excludeExts = await clack.multiselect({
      message: 'Exclude file extensions (select to exclude):',
      options: extensions.map(ext => ({ value: ext, label: ext })),
      required: false,
    });

    if (clack.isCancel(excludeExts)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }

    const filteredFiles = allFiles.filter(f => {
      if ((excludeDirs as string[]).includes(f.directory)) return false;
      if ((excludeExts as string[]).includes(f.extension)) return false;
      return true;
    });

    if (filteredFiles.length === 0) {
      clack.log.warn('No files remaining after filters');
      process.exit(0);
    }

    const fileChoices = filteredFiles.map(f => ({
      value: f.path,
      label: `${f.relativePath}${f.isText ? '' : ' [binary]'}`,
      hint: f.isText ? undefined : 'Binary file',
    }));

    const selected = await clack.multiselect({
      message: 'Select files to include:',
      options: fileChoices,
      initialValues: filteredFiles.map(f => f.path),
      required: true,
    });

    if (clack.isCancel(selected)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }

    selectedFiles = filteredFiles.filter(f => (selected as string[]).includes(f.path));
  }

  const spinner = clack.spinner();
  spinner.start('Converting files to text...');

  const output = formatFilesAsText(selectedFiles);

  spinner.stop('Files converted');

  const copySpinner = clack.spinner();
  copySpinner.start('Copying to clipboard...');

  try {
    await clipboardy.write(output);
    copySpinner.stop('✅ Copied to clipboard!');
  } catch (err) {
    copySpinner.stop('Failed to copy to clipboard');
    clack.log.error(err instanceof Error ? err.message : 'Unknown error');
    process.exit(1);
  }

  clack.outro(`📋 ${selectedFiles.length} file(s) copied to clipboard`);
}
