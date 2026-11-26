<?php
// Works on Railway (MYSQL* variables from the MySQL service), docker-compose, or local.
return [
    'host'     => getenv('MYSQLHOST') ?: (getenv('LEGACY_DB_HOST') ?: 'mysql_legacy'),
    'username' => getenv('MYSQLUSER') ?: 'legacy_test',
    'password' => getenv('MYSQLPASSWORD') ?: (getenv('LEGACY_DB_PASSWORD') ?: 'changeme'),
    'database' => getenv('MYSQLDATABASE') ?: 'legacy_test',
    'port'     => (int)(getenv('MYSQLPORT') ?: 3306),
];
