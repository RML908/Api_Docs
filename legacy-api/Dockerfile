FROM php:8.2-apache

RUN docker-php-ext-install mysqli && a2enmod rewrite

COPY apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html
