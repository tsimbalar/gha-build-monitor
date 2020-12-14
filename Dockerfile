# image build
ARG NODE_VERSION
FROM node:14.15.1-alpine AS build

# hadolint ignore=DL3018
RUN apk --no-cache add ca-certificates curl

ENV HOME_DIR /app

RUN adduser -S -D -h ${HOME_DIR} appuser
WORKDIR ${HOME_DIR}
COPY --chown=appuser:nogroup . .

USER appuser

# Add npm registry credential
RUN npm ci

# generate build
RUN npm run build

# Install just required dependencies to be used on the next stage in a clean container
RUN npm ci --production

# Use multistage to create a small size image
FROM node:14.15.1-alpine
ENV HOME_DIR /app
ENV WHATAMI gha-build-monitor
ENV NODE_ENV production

# hadolint ignore=DL3018
RUN apk --no-cache add ca-certificates

RUN adduser -S -D -h ${HOME_DIR} appuser
USER appuser

WORKDIR ${HOME_DIR}
COPY --from=build /app/node_modules/ ${HOME_DIR}/node_modules
COPY --from=build /app/dist/ ${HOME_DIR}/dist
COPY --from=build /app/package.json ${HOME_DIR}/package.json
COPY --from=build /app/docs/ ${HOME_DIR}/docs

EXPOSE 9901

CMD ["node",  "dist/index.js"]
