// Bundle analyzer wrapper — run with: npm run analyze
// This file is used only when ANALYZE=true is set.

import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import baseConfig from "./next.config";

const config: NextConfig = withBundleAnalyzer({
  enabled: true,
})(baseConfig);

export default config;
