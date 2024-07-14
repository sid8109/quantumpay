const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteOldEntries() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    await prisma.onRampTransaction.deleteMany({
      where: {
        startTime: {
          lt: sixMonthsAgo
        }
      }
    });

    await prisma.p2pTransfer.deleteMany({
      where: {
        timestamp: {
          lt: sixMonthsAgo
        }
      }
    });

    await prisma.balanceHistory.deleteMany({
      where: {
        timestamp: {
          lt: sixMonthsAgo
        }
      }
    });

    console.log('Old entries deleted successfully');
  } catch (error) {
    console.error('Error deleting old entries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOldEntries();
