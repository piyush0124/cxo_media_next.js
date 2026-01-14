import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { requireAdmin } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

// WP stores datetime as "YYYY-MM-DD HH:mm:ss"
function fmtWpDate(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toId(v: any) {
  // handles number | string | bigint
  if (typeof v === "bigint") return Number(v);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function upsertMeta(p: string, postId: number, key: string, value: string) {
  const ex = await wpPrisma.$queryRawUnsafe<any[]>(
    `SELECT CAST(meta_id AS UNSIGNED) as meta_id
     FROM ${p}postmeta
     WHERE post_id=? AND meta_key=?
     LIMIT 1`,
    postId,
    key
  );

  if (ex?.length) {
    await wpPrisma.$executeRawUnsafe(
      `UPDATE ${p}postmeta
       SET meta_value=?
       WHERE post_id=? AND meta_key=?`,
      value,
      postId,
      key
    );
  } else {
    await wpPrisma.$executeRawUnsafe(
      `INSERT INTO ${p}postmeta (post_id, meta_key, meta_value)
       VALUES (?, ?, ?)`,
      postId,
      key,
      value
    );
  }
}

async function getMeta(p: string, postId: number, key: string) {
  const rows = await wpPrisma.$queryRawUnsafe<any[]>(
    `SELECT meta_value
     FROM ${p}postmeta
     WHERE post_id=? AND meta_key=?
     LIMIT 1`,
    postId,
    key
  );
  return rows?.[0]?.meta_value ?? null;
}

async function touchPosts(p: string, ids: number[]) {
  const now = fmtWpDate(new Date());
  await wpPrisma.$executeRawUnsafe(
    `UPDATE ${p}posts
     SET post_modified=?, post_modified_gmt=?
     WHERE ID IN (${ids.map(() => "?").join(",")})`,
    now,
    now,
    ...ids
  );
}

export async function POST(req: Request) {
  // ✅ Never crash on requireAdmin()
  try {
    requireAdmin();
  } catch {
    return bad("Unauthorized", 401);
  }

  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const action = String(body.action || "").toUpperCase();

  const ids: number[] = Array.isArray(body.ids)
    ? body.ids.map((x: any) => toId(x)).filter((n) => n > 0)
    : [];

  if (!action) return bad("Missing action");
  if (!ids.length) return bad("No ids selected");

  const p = process.env.wp_TABLE_PREFIX ?? "wp_";

  // Get current status (needed for TRASH/RESTORE)
  const existing = await wpPrisma.$queryRawUnsafe<any[]>(
    `SELECT CAST(ID AS UNSIGNED) as id, post_status as status
     FROM ${p}posts
     WHERE ID IN (${ids.map(() => "?").join(",")})`,
    ...ids
  );

  // normalize rows
  const rows = existing.map((r) => ({
    id: toId(r.id),
    status: String(r.status || ""),
  }));

  // helper list of real ids found in DB
  const foundIds = rows.map((r) => r.id).filter((n) => n > 0);
  if (!foundIds.length) return bad("No matching posts found", 404);

  try {
    // ---------------- TRASH ----------------
    if (action === "TRASH") {
      const toTrash = rows.filter((r) => r.status !== "trash").map((r) => r.id);
      for (const postId of toTrash) {
        const oldStatus = rows.find((r) => r.id === postId)?.status || "draft";

        // WP-style trash meta
        await upsertMeta(p, postId, "_wp_trash_meta_status", oldStatus);
        await upsertMeta(p, postId, "_wp_trash_meta_time", String(nowUnix()));

        await wpPrisma.$executeRawUnsafe(
          `UPDATE ${p}posts SET post_status='trash' WHERE ID=?`,
          postId
        );
      }

      if (toTrash.length) await touchPosts(p, toTrash);

      return NextResponse.json(
        jsonSafe({ ok: true, action, ids: toTrash })
      );
    }

    // ---------------- RESTORE ----------------
    if (action === "RESTORE") {
      // only restore items currently in trash
      const toRestore = rows.filter((r) => r.status === "trash").map((r) => r.id);

      for (const postId of toRestore) {
        const prev = await getMeta(p, postId, "_wp_trash_meta_status");
        const restoreStatus = prev ? String(prev) : "draft";

        await wpPrisma.$executeRawUnsafe(
          `UPDATE ${p}posts SET post_status=? WHERE ID=?`,
          restoreStatus,
          postId
        );

        // cleanup meta (WP does)
        await wpPrisma.$executeRawUnsafe(
          `DELETE FROM ${p}postmeta
           WHERE post_id=? AND meta_key IN ('_wp_trash_meta_status','_wp_trash_meta_time')`,
          postId
        );
      }

      if (toRestore.length) await touchPosts(p, toRestore);

      return NextResponse.json(
        jsonSafe({ ok: true, action, ids: toRestore })
      );
    }

    // ---------------- PUBLISH / DRAFT ----------------
    if (action === "PUBLISH" || action === "DRAFT") {
      const status = action === "PUBLISH" ? "publish" : "draft";

      await wpPrisma.$executeRawUnsafe(
        `UPDATE ${p}posts
         SET post_status=?
         WHERE ID IN (${foundIds.map(() => "?").join(",")})`,
        status,
        ...foundIds
      );

      await touchPosts(p, foundIds);

      return NextResponse.json(jsonSafe({ ok: true, action, ids: foundIds }));
    }

    // ---------------- DELETE PERMANENTLY ----------------
    if (action === "DELETE") {
      // Delete relationships, meta, comments, then posts
      await wpPrisma.$executeRawUnsafe(
        `DELETE FROM ${p}term_relationships
         WHERE object_id IN (${foundIds.map(() => "?").join(",")})`,
        ...foundIds
      );

      await wpPrisma.$executeRawUnsafe(
        `DELETE FROM ${p}postmeta
         WHERE post_id IN (${foundIds.map(() => "?").join(",")})`,
        ...foundIds
      );

      await wpPrisma.$executeRawUnsafe(
        `DELETE FROM ${p}comments
         WHERE comment_post_ID IN (${foundIds.map(() => "?").join(",")})`,
        ...foundIds
      );

      await wpPrisma.$executeRawUnsafe(
        `DELETE FROM ${p}posts
         WHERE ID IN (${foundIds.map(() => "?").join(",")})`,
        ...foundIds
      );

      return NextResponse.json(jsonSafe({ ok: true, action, ids: foundIds }));
    }

    return bad("Unknown action");
  } catch (e: any) {
    return bad(e?.message || "Bulk action failed", 500);
  }
}
