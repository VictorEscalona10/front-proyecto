# Multi-stage build
FROM node:18-alpine AS build
WORKDIR /app

# --- ESTO ES LO NUEVO ---
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# ------------------------

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# Production image
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]