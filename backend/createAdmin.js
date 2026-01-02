import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const run = async () => {
  try {
    const password = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@jobfinder.com',
        password,
        name: 'Admin',
        role: 'ADMIN',
        plan: 'PRO_PLUS',
        paymentVerified: true,
        paidAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });
    console.log('✅ Admin user created');
    console.log('   Email: admin@jobfinder.com');
    console.log('   Password: Admin@123');
    console.log('   Plan: PRO_PLUS (1 year)');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Admin user already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
};

run();
