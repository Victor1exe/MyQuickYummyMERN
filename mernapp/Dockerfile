# ---------------------------------------------------------------------------
# My Quick Yummy storefront (Create React App -> nginx)
# ---------------------------------------------------------------------------

# --- Build stage -----------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# CRA inlines REACT_APP_* at build time, so the API URL is a build argument
# rather than a runtime environment variable.
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# --- Runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
