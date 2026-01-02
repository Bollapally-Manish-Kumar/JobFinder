/**
 * Script to create admin account
 * Run with: node scripts/createAdmin.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = 'admin@jobfinder.com';
    const adminPassword = 'Admin@123'; // Change this after first login!
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists:', adminEmail);
      console.log('   If you need to reset the password, delete the account first.');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        authProvider: 'local',
        isPaid: true, // Admin doesn't need to pay
        plan: 'admin',
        expiresAt: new Date('2099-12-31') // Never expires
      }
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('');
    console.log('   📧 Email:', adminEmail);
    console.log('   🔑 Password:', adminPassword);
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
