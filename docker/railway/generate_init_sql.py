"""Builds docker/railway/init.sql for the backend/ schema: migration + admin user + docs
for the legacy PHP API generated from legacy-api/openapi.yaml.
Usage: ADMIN_PASSWORD='...' python3 docker/railway/generate_init_sql.py"""
import json, os, pathlib, re, yaml
root = pathlib.Path(__file__).resolve().parents[2]
spec = yaml.safe_load(open(root / "legacy-api/openapi.yaml", encoding="utf-8"))
pw = os.environ["ADMIN_PASSWORD"]
hy = json.load(open(root / "docker/railway/translations_hy.json", encoding="utf-8"))
HY_AUTH = " Պահանջվում է վերնագիր՝ Authorization: Bearer <static API token>։"
mig = (root / "backend/src/DST_API_DOCS.Persistence/migrations/0000_complete_oracle.sql").read_text(encoding="utf-8")

def q(s): return "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"
def example(s):
    if "example" in s: return s["example"]
    t = s.get("type")
    if t == "object": return {k: example(v) for k, v in s.get("properties", {}).items()}
    if t == "array": return [example(s.get("items", {}))]
    return {"integer": 0, "number": 0, "boolean": True}.get(t, "")

out = ["-- Run once on an EMPTY Postgres database (Railway: Postgres > Data > Query).", "BEGIN;",
       "CREATE EXTENSION IF NOT EXISTS pgcrypto;", mig.replace("--> statement-breakpoint", ""),
       "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS summary_hy text, ADD COLUMN IF NOT EXISTS description_hy text;",
       "INSERT INTO users (username, email, password_hash, role) VALUES "
       f"('admin', 'admin@dst-api-docs.local', crypt({q(pw)}, gen_salt('bf', 12)), 'admin');",
       "INSERT INTO groups (name, description, icon, sort_order, created_by) VALUES "
       "('Patient Scheduling', 'Hospital scheduling test API (PHP). Base URL: https://dstapidocs.space', '📋', 0, (SELECT id FROM users WHERE username='admin'));"]
def hy_example(method, op, path):
    if method == "get" and any(p["in"] == "query" for p in op.get("parameters", [])):
        ex = "&".join(f"{p['name']}={p.get('schema',{}).get('example','')}" for p in op["parameters"] if p["in"] == "query")
        return f" Հարցման օրինակ՝ GET /legacy-api{path}?{ex}"
    return ""

n = 0
for path, ops in spec["paths"].items():
    for method, op in ops.items():
        params = {}
        for p in op.get("parameters", []):
            sch = p.get("schema", {})
            params[p["name"]] = f"{sch.get('type','string')} ({'required' if p.get('required') else 'optional'})" + (f" - {p['description']}" if p.get("description") else "")
        for c in (op.get("requestBody", {}).get("content", {}) or {}).values():
            sch = c.get("schema", {}); req = set(sch.get("required", []))
            for name, ps in sch.get("properties", {}).items():
                t = f"{ps.get('type','string')} ({'required' if name in req else 'optional'})"
                d = ps.get("description") or ("format: " + str(ps["example"]) if "example" in ps else "")
                params[name] = t + (f" - {d}" if d else "")
        resp, status = None, 200
        for code, r in op.get("responses", {}).items():
            if code.startswith("2"):
                status = int(code)
                sch = r.get("content", {}).get("application/json", {}).get("schema")
                if sch: resp = json.dumps(example(sch), indent=2, ensure_ascii=False)
                break
        desc = " ".join((op.get("description") or "").split())
        desc += " Requires header: Authorization: Bearer <static API token>."
        if method == "get" and any(p["in"] == "query" for p in op.get("parameters", [])):
            ex = "&".join(f"{p['name']}={p.get('schema',{}).get('example','')}" for p in op["parameters"] if p["in"] == "query")
            desc += f" Example request: GET /legacy-api{path}?{ex}"
        out.append("INSERT INTO endpoints (group_id, method, path, summary, description, summary_hy, description_hy, status, version, params, response_example, response_status, sort_order, created_by) VALUES "
                   f"((SELECT id FROM groups ORDER BY id DESC LIMIT 1), {q(method.upper())}, {q('/legacy-api' + path)}, {q(op['summary'])}, {q(desc)}, {q(hy[path]['summary'])}, {q(hy[path]['description'] + HY_AUTH + hy_example(method, op, path))}, 'published', 'v1', "
                   f"{q(json.dumps(params, ensure_ascii=False)) if params else 'NULL'}, {q(resp)}, {status}, {n}, (SELECT id FROM users WHERE username='admin'));")
        n += 1
out.append("COMMIT;")
(root / "docker/railway/init.sql").write_text("\n".join(out) + "\n", encoding="utf-8")
print(n, "endpoints")
