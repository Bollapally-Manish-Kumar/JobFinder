import prisma from '../utils/prisma.js';

async function main() {
  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isPaid: true,
      plan: true,
      expiresAt: true
    }
  });
  
  console.log('\n📋 USERS:');
  console.log(JSON.stringify(users, null, 2));

  // Get all payments
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.log('\n💳 RECENT PAYMENTS:');
  console.log(JSON.stringify(payments, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
