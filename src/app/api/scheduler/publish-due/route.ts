import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Optional protection: set CRON_SECRET in .env
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.post.updateMany({
    where: {
      status: "SCHEDULED",
      publishedAt: { lte: now },
    },
    data: {
      status: "PUBLISHED",
    },
  });

  return NextResponse.json({ ok: true, published: result.count, now: now.toISOString() });
}
