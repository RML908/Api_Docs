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
if ($r && $r->num_rows > 0) { echo "init_db: schema already present\n"; exit(0); }
$sql = file_get_contents(__DIR__ . '/schema.sql');
if ($db->multi_query($sql)) { do { if ($res = $db->store_result()) $res->free(); } while ($db->more_results() && $db->next_result()); }
echo $db->errno ? "init_db: error {$db->error}\n" : "init_db: schema + test data loaded\n";
