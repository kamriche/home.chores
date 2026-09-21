import type { NextConfig } from "next";

const repositoryName = "home.chores";
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPagesBuild ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPagesBuild ? `/${repositoryName}/` : undefined,
};

export default nextConfig;
