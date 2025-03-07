# Use an official Node.js runtime as a base image
FROM node:20-alpine AS build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build --prod

# Use a lightweight Nginx image to serve the application
FROM nginx:alpine

# Copy custom NGINX configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# Copy the built application from the build-stage to Nginx's default web server directory
COPY --from=build-stage /app/dist/e-commerce-admin /usr/share/nginx/html

# Expose port 8080
EXPOSE 20102

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]