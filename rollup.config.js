import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.ts',
  output: {
    dir: './build',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [
    copy({
      targets: [
        { src: ['src/assets/*'], dest: './build' },
      ],
    }),
    typescript(),
    nodeResolve({ browser: true }),
    commonjs(),
  ]
};
