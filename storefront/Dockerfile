FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BASE_URL=http://localhost:8000
ENV NEXT_PUBLIC_DEFAULT_REGION=np
ENV MEDUSA_BACKEND_URL=http://backend:9000

COPY package*.json ./
# npm install (not ci): the lock file is generated on Windows and drifts from
# Alpine npm's resolution for a few transitive deps.
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 8000

CMD ["npm", "run", "start"]
