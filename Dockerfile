# Build frontend assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend package metadata and config
COPY Frontend/package.json Frontend/package-lock.json ./
COPY Frontend/vite.config.ts ./
COPY Frontend/eslint.config.js ./
COPY Frontend/tsconfig.json Frontend/tsconfig.app.json Frontend/tsconfig.node.json ./
COPY Frontend/postcss.config.js Frontend/tailwind.config.js ./
COPY Frontend/index.html ./
COPY Frontend/public ./public
COPY Frontend/src ./src
COPY Frontend/packages ./packages
COPY Frontend/apps ./apps

RUN npm ci
RUN npm run build

# Build Python backend
FROM python:3.12-slim
WORKDIR /app

# Install Python dependencies first for caching
COPY Backend/requirements.txt ./requirements.txt
RUN python -m pip install --no-cache-dir --upgrade pip setuptools wheel && \
    python -m pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY Backend ./Backend

# Copy built frontend static assets into the expected path
COPY --from=frontend-builder /app/frontend/dist /app/Frontend/dist

ENV PORT=8080
WORKDIR /app/Backend

# Use the exec form so Docker handles signals correctly
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
