FROM node:20-alpine AS base

FROM base AS build-stage

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn workspaces focus --all

COPY . . 

RUN yarn nx build fe

FROM base AS production

LABEL git="https://github.com/lehuygiang28/tasktr"
LABEL author="lehuygiang28 <lehuygiang28@gmail.com>"
LABEL org.opencontainers.image.maintainer="lehuygiang28 <lehuygiang28@gmail.com>"

USER node

WORKDIR /usr/src/app

COPY --from=build-stage --chown=node /usr/src/app/dist/apps/fe/.next/standalone ./dist/apps/fe/.next/standalone

# Just make sure the .env file is existed
RUN mkdir -p /usr/src/app/apps/fe && \
    # Add new line to the end of the file
    echo "" >> /usr/src/app/apps/fe/.env && \
    echo "# .env created" >> /usr/src/app/apps/fe/.env

ENV PORT 3000
ENV HOST 0.0.0.0
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

EXPOSE 3000

CMD ["node", "dist/apps/fe/.next/standalone/apps/fe/server"]
