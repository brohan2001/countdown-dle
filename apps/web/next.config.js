/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@countdown/engine-core", "@countdown/game-state"],
  webpack: (config) => {
    config.output.globalObject = "self";
    return config;
  },
};

module.exports = nextConfig;
