import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  requireAuth();

  const id = Number(params.id);
  if (!id) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
    },
  });

  if (!category) {
    return NextResponse.json({ ok: false, message: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, category });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  requireAuth();

  const id = Number(params.id);
  if (!id) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });

  const name = String(body.name || "").trim();
  const slug = String(body.slug || "").trim();
  const description = body.description === undefined ? undefined : String(body.description);
  const parentId = body.parentId === "" || body.parentId == null ? null : Number(body.parentId);

  if (!name || !slug) {
    return NextResponse.json({ ok: false, message: "Name and slug are required" }, { status: 400 });
  }

  if (parentId === id) {
    return NextResponse.json({ ok: false, message: "Category cannot be its own parent" }, { status: 400 });
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description ?? null,
        parentId: parentId ?? null,
      },
      select: { id: true, name: true, slug: true, description: true, parentId: true },
    });

    return NextResponse.json({ ok: true, category: updated });
  } catch (e: any) {
    // slug unique errors etc.
    return NextResponse.json(
      { ok: false, message: e?.message || "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  requireAuth();

  const categoryId = Number(params.id);
  const reassignTo = new URL(req.url).searchParams.get("reassignTo");

  const setting = await prisma.setting.findUnique({ where: { key: "defaultCategoryId" } });
  const targetId = reassignTo
    ? Number(reassignTo)
    : setting?.value
    ? Number(setting.value)
    : null;

  if (!targetId) {
    return NextResponse.json({ ok: false, message: "Default category not set" }, { status: 409 });
  }

  if (targetId === categoryId) {
    return NextResponse.json({ ok: false, message: "Cannot reassign to same category" }, { status: 400 });
  }

  await prisma.post.updateMany({
    where: { categoryId },
    data: { categoryId: targetId },
  });

  await prisma.category.delete({ where: { id: categoryId } });

  return NextResponse.json({ ok: true });
}
