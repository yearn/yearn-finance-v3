# STAGE 1 - run build process
FROM node:14-alpine AS builder-stage
RUN apk update
RUN apk add git
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# STAGE 2 - production image
FROM nginx:1.22-alpine as prod-stage
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder-stage /usr/src/app/build ./
COPY --from=builder-stage /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
