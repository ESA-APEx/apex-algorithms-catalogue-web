FROM node:20.17-alpine AS base
WORKDIR /app

RUN apk add --no-cache libc6-compat gcompat gcc g++ make python3
COPY package.json package-lock.json ./

FROM base AS prod-deps
RUN npm install --omit=dev

FROM base AS build-deps
RUN npm install

FROM build-deps AS build
COPY . .
RUN npm run download-source
RUN npm run build

FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN mkdir -p ./tmp
RUN chown -R node:node /app/tmp
USER node
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs