FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .env.development.local ./

RUN yarn

COPY . .