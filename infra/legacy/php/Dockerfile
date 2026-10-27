# PHP + Apache cho các web Laravel cũ, kết nối Postgres chung (pdo_pgsql)
# Build:  docker build --build-arg PHP_VERSION=7.4 -t cic-legacy-php:7.4 infra/legacy/php
ARG PHP_VERSION=8.1
FROM php:${PHP_VERSION}-apache

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN install-php-extensions pdo_pgsql pgsql pdo_mysql gd zip intl bcmath exif opcache mbstring \
 && a2enmod rewrite headers expires \
 && { \
      echo 'upload_max_filesize = 64M'; \
      echo 'post_max_size = 64M'; \
      echo 'memory_limit = 512M'; \
      echo 'max_execution_time = 120'; \
      echo 'date.timezone = Asia/Ho_Chi_Minh'; \
    } > /usr/local/etc/php/conf.d/cic-legacy.ini \
 && sed -ri 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

COPY entrypoint.sh /usr/local/bin/cic-legacy-entrypoint
RUN chmod +x /usr/local/bin/cic-legacy-entrypoint

WORKDIR /var/www/html
ENTRYPOINT ["cic-legacy-entrypoint"]
CMD ["apache2-foreground"]
