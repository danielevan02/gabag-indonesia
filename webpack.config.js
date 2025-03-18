import { DefinePlugin } from 'webpack';

export const cache = {
  type: 'filesystem',
  store: 'pack', // Default yang menyebabkan warning
  compression: 'gzip', // Kurangi ukuran file cache
};
export const plugins = [
  new DefinePlugin({
    'process.env.WEBPACK_CACHE_USE_BUFFER': JSON.stringify(true),
  }),
];
