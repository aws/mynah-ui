# Use a base Node image
FROM node:22

# Set working directory
WORKDIR /app

# Copy the whole repo
COPY . .

# Install dependencies and build MynahUI
RUN npm ci
RUN npm run build
RUN cd ./ui-tests && npm ci && npm run prepare

# Default command to run the tests
CMD ["npm", "run", "tests:e2e:docker"]