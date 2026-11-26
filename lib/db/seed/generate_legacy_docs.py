"""Generates lib/db/seed/legacy-docs.sql from legacy-api/openapi.yaml.
Run: python3 lib/db/seed/generate_legacy_docs.py"""
import json, yaml, pathlib
root = pathlib.Path(__file__).resolve().parents[3]
spec = yaml.safe_load(open(root / "legacy-api/openapi.yaml", encoding="utf-8"))
base = spec["servers"][0]["url"]

def q(s):
    return "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"

def example(s):
    t = s.get("type")
    if "example" in s: return s["example"]
    if t == "object": return {k: example(v) for k, v in s.get("properties", {}).items()}
    if t == "array": return [example(s.get("items", {}))]
    return {"integer": 0, "number": 0, "boolean": True}.get(t, "")

out = ["-- Generated from legacy-api/openapi.yaml. Safe to run once on an empty database.",
       "BEGIN;",
       "INSERT INTO groups (name, description, icon, sort_order) VALUES "
       f"({q('Hospital Scheduling API (Legacy)')}, {q('PHP API for patient schedules, doctors, branches and services. Base URL: ' + base)}, {q('🏥')}, 0);"]
order = 0
for path, ops in spec["paths"].items():
    for method, op in ops.items():
        params = []
        for p in op.get("parameters", []):
            params.append({"name": p["name"], "type": p.get("schema", {}).get("type", "string"),
                           "in": p["in"], "required": bool(p.get("required")),
                           "description": p.get("description", "")})
        body = (op.get("requestBody", {}).get("content", {}) or {})
        for ct, c in body.items():
            sch = c.get("schema", {})
            req = set(sch.get("required", []))
            for name, ps in sch.get("properties", {}).items():
                d = ps.get("description", "")
                if "example" in ps: d = (d + " " if d else "") + f"Example: {ps['example']}"
                params.append({"name": name, "type": ps.get("type", "string"), "in": "body",
                               "required": name in req, "description": d})
        resp, status = None, 200
        for code, r in op.get("responses", {}).items():
            if code.startswith("2"):
                status = int(code)
                sch = r.get("content", {}).get("application/json", {}).get("schema")
                if sch: resp = json.dumps(example(sch), indent=2, ensure_ascii=False)
                break
        desc = " ".join((op.get("description") or "").split())
        desc = (desc + " " if desc else "") + "Requires header Authorization: Bearer <token>."
        out.append(
            "INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES "
            f"((SELECT id FROM groups ORDER BY id DESC LIMIT 1), {q(method.upper())}, {q(path)}, {q(op.get('summary'))}, {q(desc)}, 'published', 'v1', "
            f"{q(json.dumps(params, ensure_ascii=False))}, {q(resp)}, {status}, {order});")
        order += 1
out.append("COMMIT;")
(root / "lib/db/seed/legacy-docs.sql").write_text("\n".join(out) + "\n", encoding="utf-8")
print(order, "endpoints written")
