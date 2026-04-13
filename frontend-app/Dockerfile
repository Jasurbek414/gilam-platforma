FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV HOSTNAME=0.0.0.0
ENV BACKEND_URL=http://gilam-api:3000
EXPOSE 3001
CMD ["npm", "run", "dev"]
