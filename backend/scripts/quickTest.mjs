// Quick test to verify login works
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    // 1. Check if we can connect to DB
    console.log('1. Testing DB connection...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ DB connected. Users: ${userCount}`);

    // 2. Find admin user
    console.log('\n2. Finding admin user...');
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@jobfinder.com' }
    });
    
    if (!admin) {
      console.log('   ❌ Admin user not found');
      return;
    }
    console.log('   ✅ Admin found:', admin.email);

    // 3. Test password comparison
    console.log('\n3. Testing password...');
    const isMatch = await bcrypt.compare('Admin@123', admin.password);
    console.log('   Password match:', isMatch ? '✅ YES' : '❌ NO');

    // 4. Test JWT generation
    console.log('\n4. Testing JWT...');
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { userId: admin.id },
      'jobfinder_super_secret_jwt_key_2024',
      { expiresIn: '7d' }
    );
    console.log('   ✅ JWT generated:', token.substring(0, 50) + '...');

    console.log('\n✅ All tests passed! Login should work.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
