FROM node:20-alpine AS build
WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY angular.json .
COPY tsconfig.json .
COPY tsconfig.app.json .
COPY tsconfig.spec.json .
COPY public public
COPY src src

RUN npm ci
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/style-translator-web/browser /usr/share/nginx/html

EXPOSE 80
