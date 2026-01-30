# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Accept build arguments
ARG VITE_BACKEND_URL
ARG VITE_AGENT_URL

# Set them as environment variables for the build process
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_AGENT_URL=$VITE_AGENT_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
