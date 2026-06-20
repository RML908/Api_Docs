import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, groupsTable } from "@workspace/db";
import {
  CreateGroupBody,
  UpdateGroupParams,
  UpdateGroupBody,
  DeleteGroupParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/groups", async (req, res): Promise<void> => {
  const groups = await db
    .select()
    .from(groupsTable)
    .orderBy(asc(groupsTable.sortOrder), asc(groupsTable.createdAt));
  res.json(groups);
});

router.post("/groups", async (req, res): Promise<void> => {
  const parsed = CreateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const maxOrderRow = await db
    .select({ sortOrder: groupsTable.sortOrder })
    .from(groupsTable)
    .orderBy(asc(groupsTable.sortOrder));
  const nextOrder = maxOrderRow.length > 0
    ? Math.max(...maxOrderRow.map((r) => r.sortOrder)) + 1
    : 0;

  const [group] = await db
    .insert(groupsTable)
    .values({ ...parsed.data, sortOrder: nextOrder })
    .returning();

  res.status(201).json(group);
});

router.patch("/groups/:id", async (req, res): Promise<void> => {
  const params = UpdateGroupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [group] = await db
    .update(groupsTable)
    .set(parsed.data)
    .where(eq(groupsTable.id, params.data.id))
    .returning();

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  res.json(group);
});

router.delete("/groups/:id", async (req, res): Promise<void> => {
  const params = DeleteGroupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [group] = await db
    .delete(groupsTable)
    .where(eq(groupsTable.id, params.data.id))
    .returning();

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  res.json({ message: "Group deleted" });
});

export default router;
