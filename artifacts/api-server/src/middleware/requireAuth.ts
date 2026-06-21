import { createHash } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, apiKeysTable } from "@workspace/db";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if ((req.session as any)?.admin === true) {
    next();
    return;
  }

  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const rawKey = authHeader.slice(7).trim();
    if (rawKey) {
      const hash = createHash("sha256").update(rawKey).digest("hex");
      const [key] = await db
        .select()
        .from(apiKeysTable)
        .where(eq(apiKeysTable.keyHash, hash));

      if (key && key.isActive) {
        await db
          .update(apiKeysTable)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeysTable.id, key.id));
        next();
        return;
      }
    }
  }

  res.status(401).json({ error: "Unauthorized" });
}
