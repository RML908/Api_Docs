import { Router, type IRouter } from "express";
import { randomBytes, createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, apiKeysTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";
import { requireSessionAuth } from "../middleware/requireSessionAuth";

const router: IRouter = Router();

function generateKey(): { raw: string; hash: string; prefix: string } {
  const raw = "apk_" + randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}

router.get("/admin/api-keys", requireSessionAuth, async (req, res): Promise<void> => {
  const keys = await db
    .select({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      keyPrefix: apiKeysTable.keyPrefix,
      isActive: apiKeysTable.isActive,
      lastUsedAt: apiKeysTable.lastUsedAt,
      createdAt: apiKeysTable.createdAt,
    })
    .from(apiKeysTable)
    .orderBy(apiKeysTable.createdAt);

  res.json(keys);
});

router.post("/admin/api-keys", requireSessionAuth, async (req, res): Promise<void> => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    res.status(400).json({ error: "Key name is required" });
    return;
  }

  const { raw, hash, prefix } = generateKey();

  const [key] = await db
    .insert(apiKeysTable)
    .values({ name, keyHash: hash, keyPrefix: prefix })
    .returning({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      keyPrefix: apiKeysTable.keyPrefix,
      isActive: apiKeysTable.isActive,
      createdAt: apiKeysTable.createdAt,
    });

  res.status(201).json({ ...key, key: raw });
});

router.patch("/admin/api-keys/:id/revoke", requireSessionAuth, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid key ID" });
    return;
  }

  const [key] = await db
    .update(apiKeysTable)
    .set({ isActive: false })
    .where(eq(apiKeysTable.id, id))
    .returning({ id: apiKeysTable.id, name: apiKeysTable.name });

  if (!key) {
    res.status(404).json({ error: "Key not found" });
    return;
  }

  res.json({ message: "Key revoked", ...key });
});

router.delete("/admin/api-keys/:id", requireSessionAuth, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid key ID" });
    return;
  }

  const [key] = await db
    .delete(apiKeysTable)
    .where(eq(apiKeysTable.id, id))
    .returning({ id: apiKeysTable.id });

  if (!key) {
    res.status(404).json({ error: "Key not found" });
    return;
  }

  res.json({ message: "Key deleted" });
});

export default router;
