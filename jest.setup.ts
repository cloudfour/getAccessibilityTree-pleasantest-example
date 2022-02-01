import { configureDefaults } from 'pleasantest';
import sveltePlugin from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import alias from '@rollup/plugin-alias';
import * as path from 'path';

configureDefaults({
  moduleServer: {
    plugins: [
      alias({
        entries: [
          { find: '$lib', replacement: path.resolve(__dirname, 'src', 'lib') },
        ],
      }),
      sveltePlugin({ preprocess: sveltePreprocess() }),
    ],
  },
});
