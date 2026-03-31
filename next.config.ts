import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  webpack(config) {
    // @lobehub/icons' Avatar/Combine components pull in @lobehub/ui → antd-style → antd,
    // which we don't use. Mock them out so webpack doesn't try to bundle them.
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@lobehub/ui': false,
      'antd': false,
      'antd-style': false,
    };
    return config;
  },
};

export default nextConfig;
