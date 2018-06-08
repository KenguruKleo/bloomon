FROM node:8

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY package.json /usr/app/
RUN npm install

# copy app source
COPY ./src /usr/app/src

CMD [ "npm", "start" ]