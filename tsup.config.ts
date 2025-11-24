import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  esbuildOptions(options) {
    options.banner = {
      js: '#!/usr/bin/env node\n',
    };
  },
});
