/**
 * Script to set QR URL in database
 * Usage: node scripts/setQrUrl.js <QR_IMAGE_URL>
 * Example: node scripts/setQrUrl.js https://i.ibb.co/xxxxx/payment-qr.png
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setQrUrl() {
  const qrUrl = process.argv[2];
  
  if (!qrUrl) {
    console.log('❌ Please provide a QR URL');
    console.log('Usage: node scripts/setQrUrl.js <QR_IMAGE_URL>');
    console.log('Example: node scripts/setQrUrl.js https://i.ibb.co/xxxxx/payment-qr.png');
    process.exit(1);
  }

  try {
    const result = await prisma.adminSettings.upsert({
      where: { key: 'payment_qr_url' },
      update: { value: qrUrl },
      create: { key: 'payment_qr_url', value: qrUrl }
    });

    console.log('✅ QR URL set successfully!');
    console.log('   Key:', result.key);
    console.log('   Value:', result.value);
  } catch (error) {
    console.error('❌ Error setting QR URL:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setQrUrl();
