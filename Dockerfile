# Build frontend assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Debug: List what Docker sees in the build context
RUN echo "=== Docker Build Context Check ===" && \
    if [ -d /tmp/build ]; then ls -la /tmp/build 2>&1 || echo "No /tmp/build"; fi

# Copy frontend source files with explicit handling
COPY Frontend/package.json ./package.json
COPY Frontend/package-lock.json ./package-lock.json
COPY Frontend/vite.config.ts ./vite.config.ts
COPY Frontend/eslint.config.js ./eslint.config.js
COPY Frontend/tsconfig.json ./tsconfig.json
COPY Frontend/tsconfig.app.json ./tsconfig.app.json
COPY Frontend/tsconfig.node.json ./tsconfig.node.json
COPY Frontend/postcss.config.js ./postcss.config.js
COPY Frontend/tailwind.config.js ./tailwind.config.js
COPY Frontend/index.html ./index.html
COPY Frontend/public ./public
COPY Frontend/src ./src
COPY Frontend/packages ./packages
COPY Frontend/apps ./apps

# Debug: Verify all files exist
RUN echo "=== Frontend Files Verification ===" && \
    echo "package.json exists: $([ -f package.json ] && echo YES || echo NO)" && \
    echo "vite.config.ts exists: $([ -f vite.config.ts ] && echo YES || echo NO)" && \
    echo "tsconfig.json exists: $([ -f tsconfig.json ] && echo YES || echo NO)" && \
    echo "src directory exists: $([ -d src ] && echo YES || echo NO)" && \
    ls -la && \
    echo "=== Dependencies Installation ===" && \
    npm ci 2>&1 | tail -20

RUN echo "=== Building Frontend ===" && \
    npm run build 2>&1 | tail -30

RUN echo "=== Verifying Build Output ===" && \
    ls -la dist/ && \
    echo "dist size: $(du -sh dist/)"

# Build Python backend
FROM python:3.12-slim
WORKDIR /app

# Install Python dependencies with explicit output
COPY Backend/requirements.txt ./requirements.txt

RUN echo "=== Installing Python Dependencies ===" && \
    python -m pip install --no-cache-dir --upgrade pip setuptools wheel && \
    python -m pip install --no-cache-dir -r requirements.txt 2>&1 | tail -20

# Copy backend code
COPY Backend ./Backend

# Verify backend structure
RUN echo "=== Backend Structure ===" && \
    ls -la Backend/ && \
    echo "=== Checking main.py ===" && \
    head -100 Backend/main.py | grep -i "static_dir\|mount" || echo "Pattern not found"

# Copy built frontend dist from builder
COPY --from=frontend-builder /app/frontend/dist ./Frontend/dist

# Final verification
RUN echo "=== Final Structure ===" && \
    echo "Frontend dist exists: $([ -d Frontend/dist ] && echo YES || echo NO)" && \
    echo "Frontend dist size: $(du -sh Frontend/dist/ 2>&1)" && \
    ls -la Frontend/dist/ 2>&1 | head -20

ENV PORT=8080
WORKDIR /app/Backend

# Use the list form for proper signal handling
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

