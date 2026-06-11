import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@dsd/event-schema",
    "@dsd/audit-runtime",
    "@dsd/clinical-runtime",
    "@dsd/replay-runtime",
    "@dsd/ui-safety",
    "@dsd/runtime-sync",
  ],
};

export default nextConfig;
