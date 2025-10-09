import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const campaignCount = await prisma.campaign.count();

    console.log('\n📊 Database Connection Check:');
    console.log('================================');
    console.log('Products:', productCount);
    console.log('Users:', userCount);
    console.log('Categories:', categoryCount);
    console.log('Campaigns:', campaignCount);
    console.log('================================\n');

    if (productCount === 0 && userCount === 0) {
      console.log('⚠️  Database is EMPTY!\n');
    } else {
      console.log('✅ Database has data!\n');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
