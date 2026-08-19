# ---------------------------------------------------------------------------
# My Quick Yummy API
# ---------------------------------------------------------------------------
FROM node:20-alpine

WORKDIR /app

# Install dependencies first so this layer is cached across code changes.
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Run unprivileged. The node image already ships a `node` user.
USER node

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:5000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "index.js"]
