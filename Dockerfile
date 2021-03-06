FROM node:16-alpine
WORKDIR /opt/app
ADD package.json package.json
RUN yarn install
ADD . .
RUN yarn run build
CMD ["node", "./dist/main.js"]