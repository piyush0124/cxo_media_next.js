import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const name = Date.now() + "-" + file.name;
  const filePath = path.join(process.cwd(), "public/uploads", name);
  await writeFile(filePath, buffer);

  return NextResponse.json({ url: "/uploads/" + name });
}
