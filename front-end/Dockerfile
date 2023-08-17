FROM node:18.17.1-alpine3.18
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

# TODO
# Build static and public files (e.g. images) should be put somewhere like S3 for CDN/Cloudfront to serve
# Only bring into the container the final NextJS app - standalone mode?
# Multistage docker build - Build the app in standalone mode in the first stage
# Final stage - bring over what is needed to the final stage and run directly
# https://www.ryanmr.com/posts/next-standalone-mode
# https://nextjs.org/docs/app/api-reference/next-config-js/output