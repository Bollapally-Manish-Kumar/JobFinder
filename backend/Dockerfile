# 1️⃣ Base image
FROM node:20-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install

# 5️⃣ Copy rest of backend code
COPY . .

# 6️⃣ Generate Prisma client
RUN npx prisma generate

# 7️⃣ Expose port
EXPOSE 5000

# 8️⃣ Start server
CMD ["npm", "start"]
