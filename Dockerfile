FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV CI=true
ENV TEST_ENV=staging

# Default command: run smoke tests
CMD ["npx", "playwright", "test", "--grep", "@smoke"]
