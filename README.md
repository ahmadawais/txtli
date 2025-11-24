# txtli

> Convert folder contents to text and copy to clipboard for LLMs

A fast CLI tool that converts any folder's contents into a single text format, perfect for sharing codebases with AI assistants like Claude, ChatGPT, or other LLMs.

## Features

- 📁 **Recursive scanning** - Processes entire folder structures
- 🎯 **Interactive mode** - Select specific files, exclude directories and extensions
- 📋 **Auto clipboard** - Automatically copies output to clipboard
- 🚫 **Smart filtering** - Respects .gitignore and ignores common directories
- 📝 **Binary detection** - Handles text files, marks binary files
- ⚡ **Token efficient** - Compact headers to minimize token usage
- 🎨 **Modern UI** - Clean interface with clack prompts

## Installation

```bash
npm install -g txtli
```

## Usage

### Quick Start

Convert current directory (non-interactive):
```bash
txtli
```

Convert specific folder:
```bash
txtli /path/to/folder
```

### Interactive Mode

Use `-i` flag for full control:
```bash
txtli -i
```

Interactive mode lets you:
- Exclude specific directories
- Filter by file extensions
- Select/deselect individual files
- All files selected by default

### Examples

```bash
# Convert current directory
txtli

# Convert specific project
txtli ~/projects/my-app

# Interactive mode with file selection
txtli ~/projects/my-app -i

# Convert and share with LLM
txtli . -i
# Output is automatically in your clipboard!
```

## What Gets Ignored?

**Automatically ignored directories:**
- `node_modules`
- `.git`
- `dist`, `build`
- `.next`
- `coverage`
- `.cache`
- `.vscode`, `.idea`

**Plus:**
- All patterns in your `.gitignore` file
- Hidden files (starting with `.`)
- Binary files (images, videos, archives, etc.)

## Output Format

Files are formatted with compact headers to minimize tokens:

```
--- src/index.ts ---

[file content here]

--- src/utils/helper.ts ---

[file content here]
```

## Options

- `-i, --interactive` - Interactive mode for file selection
- `-v, --version` - Output version number
- `-h, --help` - Display help

## Development

```bash
# Clone the repo
git clone https://github.com/ahmadawais/txtli.git
cd txtli

# Install dependencies
pnpm install

# Build
pnpm build

# Link locally
npm link

# Test
txtli -i
```

## Tech Stack

- TypeScript
- Commander.js for CLI
- Clack for interactive prompts
- Clipboardy for clipboard operations
- tsup for building

## Why txtli?

When working with AI assistants, you often need to share your codebase context. txtli makes this instant:

1. Run `txtli -i` in your project
2. Select what to include
3. Paste into your AI chat
4. Get contextual help!

Perfect for:
- Getting code reviews from AI
- Debugging with AI assistance
- Explaining codebases to AI
- Quick project analysis

## License

MIT © [Ahmad Awais](https://ahmadawais.com)

## Author

**Ahmad Awais** ([@MrAhmadAwais](https://twitter.com/MrAhmadAwais))

---

<div align="center">
  <strong>txtli</strong> - Text for LLMs, Instantly
</div>
