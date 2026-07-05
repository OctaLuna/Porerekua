# syntax=docker/dockerfile:1

# ---------- Build stage: compila el frontend Vite ----------
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# La URL de la API se hornea en build (Vite lee import.meta.env.VITE_*).
# Con "/api" las llamadas son relativas → mismo origen que Nginx (sin CORS).
ARG VITE_API_URL=/api
ARG VITE_MAPTILER_KEY=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAPTILER_KEY=$VITE_MAPTILER_KEY

RUN npm run build

# ---------- Serve stage: Nginx sirve el estático + proxy /api ----------
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
