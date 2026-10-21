
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

RUN mkdir -p /app/src/uploads/documents \
    && chown -R node:node /app/src/uploads

USER node

EXPOSE 5000

CMD ["npm", "start"]
