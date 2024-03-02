###################
# BASE
###################

FROM --platform=linux/amd64 node:18.19.0-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app
COPY --chown=node:node package.json pnpm-lock.yaml ./


###################
# DEV DEPENDENCIES
###################

FROM base AS development

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --chown=node:node . .

USER node

###################
# BUILD APP FOR PRODUCTION
###################

FROM base AS build

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Run the build command which creates the production bundle, generating output in /dist
RUN pnpm build

ENV NODE_ENV production

# Keep only the production dependencies, to ensure that the node_modules directory is as optimized as possible
RUN rm -rf node_modules
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

USER node

###################
# FINAL PRODUCTION RUNNABLE IMAGE
###################

FROM node:18.19.0-alpine AS production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
