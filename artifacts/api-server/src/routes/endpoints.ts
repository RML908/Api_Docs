import { Router, type IRouter } from "express";
import { eq, asc, ilike, and, type SQL } from "drizzle-orm";
import { db, endpointsTable } from "@workspace/db";
import {
  ListEndpointsQueryParams,
  CreateEndpointBody,
  GetEndpointParams,
  UpdateEndpointParams,
  UpdateEndpointBody,
  DeleteEndpointParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

router.get("/endpoints", async (req, res): Promise<void> => {
  const query = ListEndpointsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { groupId, status, q, version } = query.data;

  const filters: SQL[] = [];
  if (groupId !== undefined) {
    filters.push(eq(endpointsTable.groupId, groupId));
  }
  if (status) {
    filters.push(eq(endpointsTable.status, status));
  }
  if (version) {
    filters.push(eq(endpointsTable.version, version));
  }
  if (q) {
    filters.push(ilike(endpointsTable.summary, `%${q}%`));
  }

  const rows = await db
    .select()
    .from(endpointsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(endpointsTable.sortOrder), asc(endpointsTable.createdAt));

  res.json(rows);
});

router.post("/endpoints", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateEndpointBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const groupRows = await db
    .select({ sortOrder: endpointsTable.sortOrder })
    .from(endpointsTable)
    .where(eq(endpointsTable.groupId, parsed.data.groupId));
  const nextOrder = groupRows.length > 0
    ? Math.max(...groupRows.map((r) => r.sortOrder)) + 1
    : 0;

  const [endpoint] = await db
    .insert(endpointsTable)
    .values({ ...parsed.data, sortOrder: nextOrder })
    .returning();

  res.status(201).json(endpoint);
});

router.get("/endpoints/:id", async (req, res): Promise<void> => {
  const params = GetEndpointParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [endpoint] = await db
    .select()
    .from(endpointsTable)
    .where(eq(endpointsTable.id, params.data.id));

  if (!endpoint) {
    res.status(404).json({ error: "Endpoint not found" });
    return;
  }

  res.json(endpoint);
});

router.patch("/endpoints/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateEndpointParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEndpointBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [endpoint] = await db
    .update(endpointsTable)
    .set(parsed.data)
    .where(eq(endpointsTable.id, params.data.id))
    .returning();

  if (!endpoint) {
    res.status(404).json({ error: "Endpoint not found" });
    return;
  }

  res.json(endpoint);
});

router.delete("/endpoints/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteEndpointParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [endpoint] = await db
    .delete(endpointsTable)
    .where(eq(endpointsTable.id, params.data.id))
    .returning();

  if (!endpoint) {
    res.status(404).json({ error: "Endpoint not found" });
    return;
  }

  res.json({ message: "Endpoint deleted" });
});

export default router;
