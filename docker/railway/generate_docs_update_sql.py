"""Builds docker/railway/update-docs.sql: ONE statement that refreshes the endpoint docs
(description, Armenian text, params, response example) of an already-initialised docs DB
from legacy-api/openapi.yaml. Matches rows by method + path. Usage: python3 docker/railway/generate_docs_update_sql.py"""
import json, pathlib, yaml
root = pathlib.Path(__file__).resolve().parents[2]
spec = yaml.safe_load(open(root / "legacy-api/openapi.yaml", encoding="utf-8"))
hy = json.load(open(root / "docker/railway/translations_hy.json", encoding="utf-8"))
HY_AUTH = " Պահանջվում է վերնագիր՝ Authorization: Bearer <static API token>։"
def q(s): return "NULL::text" if s is None else "'" + str(s).replace("'", "''") + "'"
def example(s):
    if "example" in s: return s["example"]
    t = s.get("type")
    if t == "object": return {k: example(v) for k, v in s.get("properties", {}).items()}
    if t == "array": return [example(s.get("items", {}))]
    return {"integer": 0, "number": 0, "boolean": True}.get(t, "")
def qex(op):
    return "&".join(f"{p['name']}={p.get('schema',{}).get('example','')}" for p in op.get("parameters", []) if p["in"] == "query")
rows = []
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
        resp = None
        for code, r in op.get("responses", {}).items():
            if code.startswith("2"):
                sch = r.get("content", {}).get("application/json", {}).get("schema")
                if sch: resp = json.dumps(example(sch), indent=2, ensure_ascii=False)
                break
        desc = " ".join((op.get("description") or "").split()) + " Requires header: Authorization: Bearer <static API token>."
        hd = hy[path]["description"] + HY_AUTH
        if method == "get" and qex(op):
            desc += f" Example request: GET /legacy-api{path}?{qex(op)}"
            hd += f" Հարցման օրինակ՝ GET /legacy-api{path}?{qex(op)}"
        rows.append(f"({q(method.upper())}, {q('/legacy-api' + path)}, {q(desc)}, {q(hd)}, {q(json.dumps(params, ensure_ascii=False)) if params else 'NULL::text'}, {q(resp)})")
sql = ("UPDATE endpoints e SET description = v.description, description_hy = v.description_hy, params = v.params, response_example = v.response_example, updated_at = NOW() FROM (VALUES\n"
       + ",\n".join(rows) + "\n) AS v(method, path, description, description_hy, params, response_example) WHERE e.method = v.method AND e.path = v.path;\n")
(root / "docker/railway/update-docs.sql").write_text(sql, encoding="utf-8")
print(len(rows), "endpoints")
