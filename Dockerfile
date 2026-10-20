# Version-agnostic Dockerfile for Mynah UI E2E Tests
# Supports dynamic Playwright version detection
ARG PLAYWRIGHT_VERSION=latest
FROM mcr.microsoft.com/playwright:${PLAYWRIGHT_VERSION}

# Install Node.js from NodeSource, overriding the base image's own Node.
# PLAYWRIGHT_VERSION selects the base image, and each base image carries
# whichever Node.js version was current when it was built, so the test runtime
# is not a version this repo controls. Pin it here to match the
# `node-version: '24.x'` that every CI job installing Node already uses.
# (Observed 2026-10: playwright:latest is v1.46.1-jammy, Node v20.16.0. The
# ui-tests install below resolves sass ^1.49.8 to a version whose
# chokidar/readdirp subtree needs node >= 20.19.0, so 20.16.0 is too old.)
#
# The base image configures NodeSource itself, so `>` replaces its node_20.x
# source rather than adding a competing one, and gpg needs --yes to overwrite
# the keyring it already wrote. This does not move Playwright or its browsers:
# scripts/setup-playwright.js installs the exact version that
# get-playwright-version.js derives from ui-tests/package.json.
ARG NODE_MAJOR=24
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL --retry 3 --retry-connrefused --retry-delay 2 \
        -o /tmp/nodesource.key https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    && gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg /tmp/nodesource.key \
    && rm -f /tmp/nodesource.key \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
        > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && node --version \
    && npm --version \
    && [ "$(node -p 'process.versions.node.split(".")[0]')" = "${NODE_MAJOR}" ]

# Set working directory
WORKDIR /app

# Copy the src from the root
COPY ./src /app/src

# Copy config files from root
COPY ./package.json /app
COPY ./package-lock.json /app
COPY ./postinstall.js /app
COPY ./webpack.config.js /app
COPY ./tsconfig.json /app

# Copy scripts directory for version-agnostic setup
COPY ./scripts /app/scripts

# Copy required files from ui-tests
COPY ./ui-tests/package.json /app/ui-tests/
COPY ./ui-tests/playwright.config.ts /app/ui-tests/
COPY ./ui-tests/tsconfig.json /app/ui-tests/
COPY ./ui-tests/webpack.config.js /app/ui-tests/

# Copy the directories from ui-tests
COPY ./ui-tests/__test__ /app/ui-tests/__test__
COPY ./ui-tests/src /app/ui-tests/src
COPY ./ui-tests/__snapshots__ /app/ui-tests/__snapshots__

# Install dependencies and build MynahUI
RUN npm install
RUN npm run build

# Setup Playwright with version-agnostic approach
RUN cd ./ui-tests && node ../scripts/setup-playwright.js && npm run prepare

# Ensure all browsers are installed with dependencies
RUN cd ./ui-tests && npx playwright install --with-deps

# Run health check to verify installation
RUN cd ./ui-tests && node ../scripts/docker-health-check.js

# Set environment variables for WebKit
ENV WEBKIT_FORCE_COMPLEX_TEXT=0
ENV WEBKIT_DISABLE_COMPOSITING_MODE=1

# Default command to run the tests
CMD ["sh", "-c", "cd ./ui-tests && npm run e2e${BROWSER:+:$BROWSER}"]
