FROM node:16.20.2-alpine3.18
# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app
# Installing dependencies
COPY package*.json ./
RUN npm install
# Copying source files
COPY . .
# Building app
RUN npm run build
EXPOSE 3000
# Running the app
CMD [ "npm", "start" ]
