FROM node:12-alpine AS base
WORKDIR /usr/src/app
COPY package.json package.json
COPY . .

FROM base AS dependencies
RUN apk add --no-cache make gcc g++ python
RUN npm install

FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
RUN rm -f package-lock.json
CMD ["npm", "start"]
