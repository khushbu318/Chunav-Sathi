# Build frontend assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend package files
COPY Frontend/package.json ./package.json
COPY Frontend/package-lock.json ./package-lock.json

# Copy frontend config files
COPY Frontend/vite.config.ts ./vite.config.ts
COPY Frontend/eslint.config.js ./eslint.config.js
COPY Frontend/tsconfig.json ./tsconfig.json
COPY Frontend/tsconfig.app.json ./tsconfig.app.json
COPY Frontend/tsconfig.node.json ./tsconfig.node.json
COPY Frontend/postcss.config.js ./postcss.config.js
COPY Frontend/tailwind.config.js ./tailwind.config.js
COPY Frontend/index.html ./index.html

# Copy frontend source
COPY Frontend/public ./public
COPY Frontend/src ./src
COPY Frontend/apps ./apps

# Install and build
RUN npm ci && npm run build

# Build Python backend
FROM python:3.12-slim
WORKDIR /app

# Install Python dependencies
COPY Backend/requirements.txt ./requirements.txt
RUN python -m pip install --no-cache-dir --upgrade pip setuptools wheel && \
    python -m pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY Backend ./Backend

# Copy frontend dist from builder
COPY --from=frontend-builder /app/frontend/dist ./Frontend/dist

ENV PORT=8080
WORKDIR /app/Backend

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]


