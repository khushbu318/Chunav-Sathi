# Build frontend assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY Frontend/package*.json ./
COPY Frontend/tsconfig*.json ./
COPY Frontend/vite.config.ts ./
COPY Frontend/src ./src
COPY Frontend/public ./public
# Copy other config files
COPY Frontend/*.js ./
COPY Frontend/index.html ./

RUN npm ci
RUN npm run build

# Build Python backend
FROM python:3.12-slim
WORKDIR /app

# Install Python dependencies
COPY Backend/requirements.txt ./Backend/requirements.txt
RUN python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir -r Backend/requirements.txt

# Copy Backend code
COPY Backend ./Backend

# CRITICAL FIX: Ensure the folder name matches exactly what main.py expects
# We create /app/Frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./Frontend/dist

ENV PORT=8080
WORKDIR /app/Backend

# Use the list format for CMD to ensure signals are handled correctly
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]