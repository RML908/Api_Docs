import { Router } from "express";
import { db, changelogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { requireSessionAuth } from "../middleware/requireSessionAuth";

const router = Router();

const changelogInputSchema = z.object({
  version: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  publishedAt: z.string().nullable().optional(),
});

const listQuerySchema = z.object({
  version: z.string().optional(),
});

// GET /api/changelogs — public
router.get("/changelogs", async (req, res) => {
  const query = listQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { version } = query.data;

  let rows = await db
    .select()
    .from(changelogsTable)
    .orderBy(desc(changelogsTable.createdAt));

  if (version) {
    rows = rows.filter((r) => r.version === version);
  }

  res.json(rows);
});

// POST /api/changelogs — auth required
router.post("/changelogs", requireAuth, async (req, res) => {
  const body = changelogInputSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { version, title, content, publishedAt } = body.data;

  const [row] = await db
    .insert(changelogsTable)
    .values({
      version,
      title,
      content,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    })
    .returning();

  res.status(201).json(row);
});

// PATCH /api/changelogs/:id — auth required
router.patch("/changelogs/:id", requireSessionAuth, async (req, res) => {
  const id = Number(req.params.id);
  const body = changelogInputSchema.partial().safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(changelogsTable)
    .where(eq(changelogsTable.id, id))
    .limit(1);

  if (!existing.length) {
    res.status(404).json({ error: "Changelog not found" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.version !== undefined) updateData.version = body.data.version;
  if (body.data.title !== undefined) updateData.title = body.data.title;
  if (body.data.content !== undefined) updateData.content = body.data.content;
  if (body.data.publishedAt !== undefined)
    updateData.publishedAt = body.data.publishedAt ? new Date(body.data.publishedAt) : null;

  const [row] = await db
    .update(changelogsTable)
    .set(updateData)
    .where(eq(changelogsTable.id, id))
    .returning();

  res.json(row);
});

// DELETE /api/changelogs/:id — session only
router.delete("/changelogs/:id", requireSessionAuth, async (req, res) => {
  const id = Number(req.params.id);

  const existing = await db
    .select()
    .from(changelogsTable)
    .where(eq(changelogsTable.id, id))
    .limit(1);

  if (!existing.length) {
    res.status(404).json({ error: "Changelog not found" });
    return;
  }

  await db.delete(changelogsTable).where(eq(changelogsTable.id, id));
  res.json({ message: "Changelog deleted" });
});

export default router;
