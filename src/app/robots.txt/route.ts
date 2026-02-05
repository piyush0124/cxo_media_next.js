import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const robotsIndex = await getSetting("seo.robots_index", "1"); // "1" allow
  const allow = robotsIndex === "1";

  const txt = [
    "User-agent: *",
    allow ? "Disallow:" : "Disallow: /",
    "",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");

  return new NextResponse(txt, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
