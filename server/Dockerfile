FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=3001
ENV NODE_ENV=production

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "src/index.js"]
