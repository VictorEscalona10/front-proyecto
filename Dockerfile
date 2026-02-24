# Usamos Node 24 para que coincida con tu entorno
FROM node:24 AS build
WORKDIR /app

# --- Variables de entorno para Vite ---
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# --------------------------------------

COPY package*.json ./
# Usamos install para evitar los bloqueos estrictos de 'ci'
RUN npm install

COPY . .
# Guardamos todo lo que diga Vite en un archivo de texto. Si falla, mostramos el texto completo y morimos.
RUN npm run build > error_log.txt 2>&1 || (cat error_log.txt && exit 1)

# Production image (Nginx sí puede ser alpine porque es muy ligero)
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]