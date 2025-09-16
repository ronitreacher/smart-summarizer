#!/bin/sh

# Use 'envsubst' to replace the ${PORT} variable in the NGINX config template
# with the value of the PORT environment variable.
# The result is written to the final NGINX configuration file.
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX in the foreground
exec nginx -g 'daemon off;'
