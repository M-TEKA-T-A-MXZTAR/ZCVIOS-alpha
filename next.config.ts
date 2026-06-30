import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const cspConnectSrc = process.env.CSP_CONNECT_SRC
  ? process.env.CSP_CONNECT_SRC.split(/\s+/).filter(Boolean).join(" ")
  : "";
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `style-src 'self'${isDev ? " 'unsafe-inline'" : ""}`,
  `script-src 'self'${isDev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self'${cspConnectSrc ? ` ${cspConnectSrc}` : ""}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: csp,
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
