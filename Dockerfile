FROM node:18-alpine

WORKDIR /app

# Copy backend first
COPY backend/package*.json ./
RUN npm install

# Copy full project
COPY . .

EXPOSE 8080

CMD ["node", "backend/server.js"]