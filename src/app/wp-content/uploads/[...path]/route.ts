import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function safeResolve(rootDir: string, parts: string[]) {
  const root = path.resolve(rootDir);
  const target = path.resolve(root, ...parts);

  if (!target.startsWith(root + path.sep) && target !== root) {
    throw new Error("Invalid path traversal");
  }
  return target;
}

export async function GET(req: Request, ctx: { params: { path: string[] } }) {
  const uploadsRoot =
    process.env.WP_UPLOADS_PATH ||
    process.env.WP_ROOT_PATH
      ? path.join(process.env.WP_ROOT_PATH as string, "wp-content", "uploads")
      : "";

  const parts = ctx.params.path || [];

  let filePath = "";
  let exists = false;

  try {
    if (!uploadsRoot) {
      return new NextResponse("WP_UPLOADS_PATH missing", {
        status: 500,
        headers: { "x-debug": "no-uploads-root" },
      });
    }

    filePath = safeResolve(uploadsRoot, parts);

    try {
      await fs.access(filePath);
      exists = true;
    } catch {
      exists = false;
    }

    if (!exists) {
      // return 404 but WITH DEBUG HEADERS
      return new NextResponse("Not found", {
        status: 404,
        headers: {
          "x-uploads-root": uploadsRoot,
          "x-file-path": filePath,
          "x-exists": String(exists),
        },
      });
    }

    const buf = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "x-uploads-root": uploadsRoot,
        "x-file-path": filePath,
        "x-exists": String(exists),
      },
    });
  } catch (e: any) {
    return new NextResponse("Error", {
      status: 500,
      headers: {
        "x-uploads-root": uploadsRoot || "EMPTY",
        "x-file-path": filePath || "EMPTY",
        "x-error": e?.message || "unknown",
      },
    });
  }
}
