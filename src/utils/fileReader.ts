import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';

export interface FileInfo {
  path: string;
  relativePath: string;
  content: string;
  isText: boolean;
  extension: string;
  directory: string;
}

const BINARY_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
  '.zip', '.tar', '.gz', '.rar', '.7z',
  '.exe', '.dll', '.so', '.dylib',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
]);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.cache',
  '.vscode',
  '.idea',
]);

function parseGitignore(baseDir: string): Set<string> {
  const gitignorePath = join(baseDir, '.gitignore');
  const patterns = new Set<string>();

  if (!existsSync(gitignorePath)) return patterns;

  try {
    const content = readFileSync(gitignorePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        patterns.add(trimmed.replace(/\/$/, ''));
      }
    }
  } catch {
    // Ignore errors
  }

  return patterns;
}

function shouldIgnore(relativePath: string, gitignorePatterns: Set<string>): boolean {
  const parts = relativePath.split('/');

  for (const pattern of gitignorePatterns) {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      if (regex.test(relativePath) || parts.some(part => regex.test(part))) {
        return true;
      }
    } else {
      if (relativePath === pattern || relativePath.startsWith(pattern + '/') || parts.includes(pattern)) {
        return true;
      }
    }
  }

  return false;
}

export function getAllFiles(dirPath: string, baseDir: string = dirPath, gitignorePatterns?: Set<string>): FileInfo[] {
  const files: FileInfo[] = [];

  if (!gitignorePatterns) {
    gitignorePatterns = parseGitignore(baseDir);
  }

  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relativePath = relative(baseDir, fullPath);

      if (item.startsWith('.') && item !== '.') continue;
      if (shouldIgnore(relativePath, gitignorePatterns)) continue;

      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          if (IGNORE_DIRS.has(item)) continue;
          files.push(...getAllFiles(fullPath, baseDir, gitignorePatterns));
        } else if (stat.isFile()) {
          const ext = item.substring(item.lastIndexOf('.')).toLowerCase();
          const isText = !BINARY_EXTENSIONS.has(ext);
          const directory = relative(baseDir, dirPath) || '.';

          let content = '';
          if (isText) {
            try {
              content = readFileSync(fullPath, 'utf-8');
            } catch {
              content = '[Unable to read file]';
            }
          } else {
            content = '[Binary file]';
          }

          files.push({
            path: fullPath,
            relativePath,
            content,
            isText,
            extension: ext || 'no-ext',
            directory,
          });
        }
      } catch (err) {
        continue;
      }
    }
  } catch (err) {
    throw new Error(`Failed to read directory: ${dirPath}`);
  }

  return files;
}

export function formatFilesAsText(files: FileInfo[]): string {
  let output = '';

  for (const file of files) {
    output += `\n--- ${file.relativePath} ---\n\n`;
    output += file.content;
    output += '\n\n';
  }

  return output;
}
