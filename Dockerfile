# Etapa 1: Construcción
FROM node:20.11.1 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install -g @angular/cli
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:1.21.5-alpine AS release
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/task-manager-app/browser/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
