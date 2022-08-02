import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  nodeResolve: true,
  basePath: 'de',
  coverageConfig: {
    exclude: [
      '**/mocks/**',
      '**/node_modules/**',
      '**/test/**',
      '**/deps/**',
      // TODO: folders below need to have tests written for 100% coverage
      '**/ui/controls/**',
      '**/hooks/**',
    ],
  },
  plugins: [importMapsPlugin({})],
};
