// Check admin user
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAdmin() {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@jobfinder.com' }
  });
  
  console.log('Admin user:', JSON.stringify(user, null, 2));
  
  if (user && user.password) {
    const testPassword = 'Admin@123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password Admin@123 matches:', isMatch);
  }
  
  await prisma.$disconnect();
}

checkAdmin();
