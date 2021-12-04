FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
CMD [ "node", "src/app.js" ]