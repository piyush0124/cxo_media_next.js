import { NextResponse } from "next/server";
import wpPrisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const id = Number(params.id);
  if (!id) return bad("Invalid id");

  const [post, categories] = await Promise.all([
    wpPrisma.post.findUnique({
      where: { id },
      include: { category: true },
    }),
    wpPrisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json(jsonSafe({ ok: true, post, categories }));
}
