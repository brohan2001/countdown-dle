/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@countdown/engine-core", "@countdown/game-state"],
};

module.exports = nextConfig;
