FROM node:lts AS builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json .
COPY src ./src
RUN npm run build

FROM node:lts
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /usr/app/lib ./lib
CMD ["node", "/usr/app/lib/main.js"]
