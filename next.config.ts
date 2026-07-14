import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: appRoot,
  /* config options here */
  reactStrictMode: true,
  allowedDevOrigins: ["*.space-z.ai"],
  async headers() {
    const authNoStoreHeaders = [
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
      {
        key: "Pragma",
        value: "no-cache",
      },
      {
        key: "Expires",
        value: "0",
      },
    ];
    const revalidatedScriptHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=0, must-revalidate",
      },
    ];
    const runtimeConfigHeaders = [
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    ];
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://drop-cv-backend.vercel.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://payment.zarinpal.com https://sandbox.zarinpal.com; object-src 'none'",
      },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...(isVercel ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/login.html",
        headers: authNoStoreHeaders,
      },
      {
        source: "/signup.html",
        headers: authNoStoreHeaders,
      },
      {
        source: "/dashboard-standard.html",
        headers: authNoStoreHeaders,
      },
      {
        source: "/dashboard-premium.html",
        headers: authNoStoreHeaders,
      },
      {
        source: "/dashboard.html",
        headers: authNoStoreHeaders,
      },
      {
        source: "/billing.html",
        headers: authNoStoreHeaders,
      },
      {
        source: "/settings-email-confirm.html",
        headers: authNoStoreHeaders,
      },
      {
        source: "/dropcv-auth.js",
        headers: revalidatedScriptHeaders,
      },
      {
        source: "/dashboard-real-data.js",
        headers: revalidatedScriptHeaders,
      },
      {
        source: "/dashboard-app.js",
        headers: revalidatedScriptHeaders,
      },
      {
        source: "/dashboard-app.css",
        headers: revalidatedScriptHeaders,
      },
      {
        source: "/dropcv-upload.js",
        headers: revalidatedScriptHeaders,
      },
      {
        source: "/dropcv-api.js",
        headers: revalidatedScriptHeaders,
      },
      {
        source: "/api/dropcv-api.js",
        headers: revalidatedScriptHeaders,
      },
      {
        source: "/site-config.js",
        headers: runtimeConfigHeaders,
      },
      {
        source: "/site-config.production.js",
        headers: runtimeConfigHeaders,
      },
    ];
  },
};

export default nextConfig;
