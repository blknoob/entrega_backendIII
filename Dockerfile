FROM node:20.11.0

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY src/ ./src/

ENV NODE_ENV=production

ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]