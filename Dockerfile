# syntax=docker/dockerfile:1.7
FROM node:20.17-bookworm-slim AS base
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

FROM base AS prod-deps
RUN npm install --omit=dev

FROM base AS build-deps
RUN npm install

FROM build-deps AS build
COPY . .
RUN --mount=type=secret,id=discourse_api_key,env=DISCOURSE_API_KEY \
    --mount=type=secret,id=discourse_api_username,env=DISCOURSE_API_USERNAME \
    --mount=type=secret,id=discourse_category_id,env=DISCOURSE_CATEGORY_ID \
    BUILD_TARGET=production npm run build

FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/acl-mapping.json ./dist/server/acl-mapping.json

RUN mkdir -p ./tmp
RUN chown -R node:node ./tmp
USER node
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs
