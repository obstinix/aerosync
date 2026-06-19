FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN node prisma-setup.js
EXPOSE 9001
CMD ["npm", "run", "start"]
