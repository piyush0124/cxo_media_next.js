export function getSiteUrl() {
  // In dev, Next runs on localhost:3000
  const envUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;

  // Fallback (safe for local)
  return "http://localhost:3000";
}
