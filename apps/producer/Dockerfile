FROM node:22.18.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig.json ./

COPY apps/producer ./apps/producer

RUN npm install

RUN npm run build producer

EXPOSE 3001

CMD ["npm", "run", "start:producer"]