import prisma from '../utils/prisma.js';

async function main() {
  // Update user with correct plan from their payment
  const userId = 'cc0feee3-30ba-48fe-925d-e12bcdeffc52';
  
  // Get user's verified payment to find their plan
  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      status: 'verified'
    },
    orderBy: { verifiedAt: 'desc' }
  });

  if (payment) {
    // Update user with the plan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan: payment.plan }
    });
    
    console.log('✅ User updated:');
    console.log({
      name: updatedUser.name,
      isPaid: updatedUser.isPaid,
      plan: updatedUser.plan
    });
  } else {
    console.log('No verified payment found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
