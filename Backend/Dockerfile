
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV DATA_DIR=/app/data

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "src/server.js"]
