# 1️⃣ Base image
FROM node:20-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files AND prisma schema (needed for postinstall)
COPY package*.json ./
COPY prisma ./prisma/

# 4️⃣ Install dependencies (postinstall will run prisma generate)
RUN npm install

# 5️⃣ Copy rest of backend code
COPY . .

# 6️⃣ Expose port
EXPOSE 5000

# 7️⃣ Start server
CMD ["npm", "start"]
