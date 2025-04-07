# Use a base Node image
FROM node:22

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
RUN if [ -d "./ui-tests/__results__/__snapshots__" ]; then \
    mkdir -p /app/ui-tests/__results__/__snapshots__ && \
    cp -r ./ui-tests/__results__/__snapshots__/* /app/ui-tests/__results__/__snapshots__/ || true; \
    fi
COPY ./ui-tests/src /app/ui-tests/src

# Install dependencies and build MynahUI
RUN npm install
RUN npm run build
RUN cd ./ui-tests && npm install && npm run prepare

# Default command to run the tests
CMD ["npm", "run", "docker:internal"]