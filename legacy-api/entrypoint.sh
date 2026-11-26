#!/bin/sh
PORT="${PORT:-80}"
# Railway's private network is IPv6: listen on [::] (dual-stack, also accepts IPv4) when available
if [ -f /proc/net/if_inet6 ]; then LISTEN="[::]:${PORT}"; else LISTEN="${PORT}"; fi
sed -i "s/^Listen 80$/Listen ${LISTEN}/" /etc/apache2/ports.conf
sed -i "s/\*:80/*:${PORT}/" /etc/apache2/sites-available/000-default.conf
php /var/www/html/init_db.php
exec apache2-foreground
