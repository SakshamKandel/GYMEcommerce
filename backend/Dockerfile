FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 9000

# Migrations run on boot so a fresh database self-initializes.
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
