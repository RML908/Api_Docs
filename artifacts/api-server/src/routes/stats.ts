import { Router, type IRouter } from "express";
import { count, eq } from "drizzle-orm";
import { db, endpointsTable, groupsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const [totals] = await db
    .select({ total: count() })
    .from(endpointsTable);

  const [published] = await db
    .select({ count: count() })
    .from(endpointsTable)
    .where(eq(endpointsTable.status, "published"));

  const [draft] = await db
    .select({ count: count() })
    .from(endpointsTable)
    .where(eq(endpointsTable.status, "draft"));

  const [deprecated] = await db
    .select({ count: count() })
    .from(endpointsTable)
    .where(eq(endpointsTable.status, "deprecated"));

  const [groups] = await db
    .select({ count: count() })
    .from(groupsTable);

  res.json({
    total: totals?.total ?? 0,
    published: published?.count ?? 0,
    draft: draft?.count ?? 0,
    deprecated: deprecated?.count ?? 0,
    groups: groups?.count ?? 0,
  });
});

export default router;
