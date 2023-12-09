FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .env.development.local ./

RUN yarn

COPY . .

ARG APP_NAME

EXPOSE 3000

CMD yarn start:dev $APP_NAME
