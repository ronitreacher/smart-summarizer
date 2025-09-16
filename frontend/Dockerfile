# smart-meeting-summarizer/frontend/Dockerfile

# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Stage 2: Serve the static files with NGINX
FROM nginx:1.25-alpine

# Copy the build output from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the NGINX config as a template that can be modified
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy the startup script
COPY start-nginx.sh /start-nginx.sh

# Make the startup script executable
RUN chmod +x /start-nginx.sh

# Expose port 8080 by default (Cloud Run will override this with its PORT variable)
EXPOSE 8080

# Run the startup script as the container's command
CMD ["/start-nginx.sh"]
