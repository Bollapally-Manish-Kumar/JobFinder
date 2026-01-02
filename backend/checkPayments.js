import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pending = await prisma.payment.findMany({
    where: { status: 'pending' },
    include: { user: { select: { email: true } } }
  });
  
  console.log('Pending payments:', pending.length);
  pending.forEach(p => {
    console.log(`- ${p.id} | ${p.user?.email} | UTR: ${p.utr} | Created: ${p.createdAt}`);
  });
  
  // Clear pending payments older than 5 min (to unblock)
  const cleared = await prisma.payment.updateMany({
    where: {
      status: 'pending',
      createdAt: { lt: new Date(Date.now() - 5 * 60 * 1000) }
    },
    data: { status: 'expired' }
  });
  console.log(`\nExpired ${cleared.count} old pending payments`);
  
  await prisma.$disconnect();
}

main();
