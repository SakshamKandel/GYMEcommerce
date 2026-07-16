FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
# npm install (not ci): the lock file is generated on Windows and drifts from
# Alpine npm's resolution for a few transitive deps.
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 9000

# Migrations run on boot so a fresh database self-initializes.
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
