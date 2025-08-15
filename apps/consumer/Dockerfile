FROM node:22.18.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig.json ./

COPY apps/consumer ./apps/consumer

RUN npm install

RUN npm run build consumer

EXPOSE 3000

CMD ["npm", "run", "start:consumer"]