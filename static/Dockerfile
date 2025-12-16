FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy website files to nginx html directory
COPY index.html styles.css script.js /usr/share/nginx/html/

# Copy images directory
COPY images/ /usr/share/nginx/html/images/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions (nginx runs as nginx user)
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod 644 /usr/share/nginx/html/*.html /usr/share/nginx/html/*.css /usr/share/nginx/html/*.js 2>/dev/null || true && \
    find /usr/share/nginx/html/images -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html/images -type d -exec chmod 755 {} \; && \
    chown -R nginx:nginx /usr/share/nginx/html/images

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

