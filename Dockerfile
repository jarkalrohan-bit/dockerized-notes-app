FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install mysql2 

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]

