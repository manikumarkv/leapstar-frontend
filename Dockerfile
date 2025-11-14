# syntax=docker/dockerfile:1
FROM node:18-alpine AS builder

WORKDIR /workspace

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY tsconfig.base.json ./tsconfig.base.json
COPY tsconfig.json ./tsconfig.json
COPY turbo.json ./turbo.json

RUN npm install

COPY . ./

RUN npm run build:frontend && npm prune --omit=dev

FROM node:18-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /workspace/frontend/dist ./dist
COPY --from=builder /workspace/frontend/package.json ./package.json

RUN npm install -g serve

EXPOSE 4173

CMD ["serve", "-s", "dist"]
