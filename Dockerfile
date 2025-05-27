# Use the official Playwright image which includes browsers
FROM mcr.microsoft.com/playwright:v1.52.0

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

# Copy required files from ui-tests
COPY ./ui-tests/package.json /app/ui-tests/
COPY ./ui-tests/playwright.config.ts /app/ui-tests/
COPY ./ui-tests/tsconfig.json /app/ui-tests/
COPY ./ui-tests/webpack.config.js /app/ui-tests/

# Copy the __test__, __results__, and src directories from ui-tests
COPY ./ui-tests/__test__ /app/ui-tests/__test__
COPY ./ui-tests/__snapshots__ /app/ui-tests/__snapshots__

# Create necessary directories
RUN mkdir -p /app/ui-tests/__snapshots__/chromium \
    && mkdir -p /app/ui-tests/__snapshots__/webkit \
    && mkdir -p /app/ui-tests/__results__

# Copy snapshots
COPY ./ui-tests/__snapshots__/* /app/ui-tests/__snapshots__/

# Install dependencies and build MynahUI
RUN npm install
RUN npm run build
RUN cd ./ui-tests && npm install && npm run prepare

# Default command to run the tests
CMD cd ./ui-tests && npm run e2e${BROWSER:+:$BROWSER}