import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

// Read version from package.json at build time
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const version = packageJson.version;

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'node20',
  outDir: 'dist',
  define: {
    'process.env.PORT_SDK_VERSION': JSON.stringify(version),
  },
});

