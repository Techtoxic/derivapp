# Multi-stage build to prevent Windows path issues and ensure all packages compile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json lerna.json nx.json tsconfig.json babel.config.json postcss.config.js .prettierrc .eslintrc.js .stylelintrc.js ./

# Copy all packages
COPY packages ./packages

# Copy build scripts and config
COPY scripts ./scripts
COPY types ./types
COPY hooks ./hooks
COPY jest.config.js jest.setup.js .commitlintrc.json ./

# Install dependencies with strict peer deps
RUN npm run bootstrap

# Fix Windows path compatibility in svg-sprite-loader regex before build
# This prevents "Cannot read properties of null" errors on Windows paths
RUN sed -i "s|const category = /components\\/icon\\/\(\[\\\\w-\]*\)\\/\.exec(svgPath)\[1\];|const normalized_svg_path = svgPath.replace(/\\\\\\\\/g, '/'); const match = /components\\/icon\\/\(\[\\\\w-\]*\)\\/\.exec(normalized_svg_path); const category = match ? match\[1\] : '';|g" packages/components/webpack.config.js || true

# Create missing directories that webpack expects
RUN mkdir -p packages/cashier/dist/cashier/public packages/cashier/dist/cashier/js packages/cashier/dist/cashier/css

# Build all packages in correct order
RUN npm run build:all

# Production stage - nginx runtime
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy built core artifacts to nginx
COPY --from=builder /app/packages/core/dist .

# Copy nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80 for Vercel
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

