<?php
return [
    'host' => 'mysql_legacy',
    'username' => 'legacy_test',
    'password' => getenv('LEGACY_DB_PASSWORD') ?: 'changeme',
    'database' => 'legacy_test',
];
