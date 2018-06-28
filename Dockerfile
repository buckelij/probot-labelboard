FROM node:8

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json package-lock.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
RUN npm test

EXPOSE 3000
CMD [ "npm", "start" ]
