<?php
// PHP 8.1+ makes mysqli throw exceptions (HTTP 500 with an empty body). Keep the old PHP 7
// behaviour: a failed query returns false and the endpoint answers with its JSON error.
mysqli_report(MYSQLI_REPORT_OFF);
// Works on Railway (MYSQL* variables from the MySQL service), docker-compose, or local.
return [
    'host'     => getenv('MYSQLHOST') ?: (getenv('LEGACY_DB_HOST') ?: 'mysql_legacy'),
    'username' => getenv('MYSQLUSER') ?: 'legacy_test',
    'password' => getenv('MYSQLPASSWORD') ?: (getenv('LEGACY_DB_PASSWORD') ?: 'changeme'),
    'database' => getenv('MYSQLDATABASE') ?: 'legacy_test',
    'port'     => (int)(getenv('MYSQLPORT') ?: 3306),
];
