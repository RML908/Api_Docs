<?php
// CLI only: creates the tables + test data once (skips if already created).
if (php_sapi_name() !== 'cli') { exit(1); }
$c = include __DIR__ . '/config.php';
$db = null;
for ($i = 0; $i < 30; $i++) {
    mysqli_report(MYSQLI_REPORT_OFF);
    $db = @new mysqli($c['host'], $c['username'], $c['password'], $c['database'], $c['port']);
    if (!$db->connect_errno) break;
    fwrite(STDERR, "init_db: waiting for MySQL ({$db->connect_error})\n");
    sleep(2);
}
if (!$db || $db->connect_errno) { fwrite(STDERR, "init_db: MySQL unavailable, skipping\n"); exit(0); }
$db->set_charset('utf8mb4');
$r = $db->query("SHOW TABLES LIKE 'structure_branch_list'");
function run_sql($db, $file) {
    if ($db->multi_query(file_get_contents($file))) { do { if ($res = $db->store_result()) $res->free(); } while ($db->more_results() && $db->next_result()); }
    return $db->errno ? "error {$db->error}" : "ok";
}
if (!($r && $r->num_rows > 0)) { echo "init_db: base schema + test data: " . run_sql($db, __DIR__ . '/schema.sql') . "\n"; }
else { echo "init_db: base schema already present\n"; }
// Idempotent migrations (CREATE TABLE IF NOT EXISTS + guarded inserts), safe on every start
foreach (glob(__DIR__ . '/migrations/*.sql') as $m) { echo "init_db: " . basename($m) . ": " . run_sql($db, $m) . "\n"; }
