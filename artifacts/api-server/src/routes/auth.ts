import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/auth/login", (req, res): void => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password) {
    res.status(400).json({ error: "Password required" });
    return;
  }

  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "admin123";

  if (password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  (req.session as any).admin = true;
  res.json({ ok: true });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res): void => {
  const isAdmin = (req.session as any)?.admin === true;
  res.json({ isAdmin });
});

export default router;
