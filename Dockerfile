# Multi-stage Dockerfile for Chunav-Sathi

# Build frontend assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY Frontend/package*.json ./
COPY Frontend/tsconfig*.json ./
COPY Frontend/vite.config.ts ./
COPY Frontend/postcss.config.js ./
COPY Frontend/tailwind.config.js ./
COPY Frontend/index.html ./
COPY Frontend/public ./public
COPY Frontend/src ./src

RUN npm ci
RUN npm run build

# Build Python backend and package runtime image
FROM python:3.12-slim
WORKDIR /app

COPY Backend/requirements.txt ./Backend/requirements.txt
RUN python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir -r Backend/requirements.txt

COPY Backend ./Backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PORT=8080
ENV PYTHONUNBUFFERED=1
EXPOSE 8080

WORKDIR /app/Backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
