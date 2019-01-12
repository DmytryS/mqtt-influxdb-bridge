#Base image
FROM node:8-alpine AS base
WORKDIR /usr/src/app
COPY src src
COPY package.json package.json
COPY .babelrc .babelrc

#Image for building and installing dependencies
FROM base AS dependencies
RUN apk add --no-cache make gcc g++ python
RUN npm install

#Relase image for running api
FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
RUN rm -f package-lock.json
CMD ["npm", "start"]
