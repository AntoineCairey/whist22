FROM node:23-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]
