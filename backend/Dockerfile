# 1️⃣ Base image (using slim instead of alpine for Prisma compatibility)
FROM node:20-slim

# 2️⃣ Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 3️⃣ Set working directory
WORKDIR /app

# 4️⃣ Copy package files AND prisma schema (needed for postinstall)
COPY package*.json ./
COPY prisma ./prisma/

# 5️⃣ Install dependencies (postinstall will run prisma generate)
RUN npm install

# 6️⃣ Copy rest of backend code
COPY . .

# 7️⃣ Expose port
EXPOSE 5000

# 8️⃣ Start server
CMD ["npm", "start"]
