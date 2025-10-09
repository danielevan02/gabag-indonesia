import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🚀 Starting data export...');

    const data = {
      users: await prisma.user.findMany(),
      categories: await prisma.category.findMany({
        include: {
          mediaFile: true
        }
      }),
      subCategories: await prisma.subCategory.findMany({
        include: {
          mediaFile: true
        }
      }),
      products: await prisma.product.findMany({
        include: {
          images: {
            include: {
              mediaFile: true
            }
          },
          variants: {
            include: {
              mediaFile: true
            }
          },
        }
      }),
      campaigns: await prisma.campaign.findMany({
        include: {
          items: true
        }
      }),
      vouchers: await prisma.voucher.findMany(),
      carousels: await prisma.carousel.findMany({
        include: {
          desktopImage: true,
          mobileImage: true
        }
      }),
      orders: await prisma.order.findMany({
        include: {
          orderItems: true
        }
      }),
      reviews: await prisma.review.findMany(),
    };

    // Save to JSON file (with BigInt serialization)
    fs.writeFileSync(
      'database-backup.json',
      JSON.stringify(data, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2)
    );

    console.log('✅ Data exported successfully to database-backup.json');
    console.log(`📊 Statistics:
- Users: ${data.users.length}
- Categories: ${data.categories.length}
- SubCategories: ${data.subCategories.length}
- Products: ${data.products.length}
- Campaigns: ${data.campaigns.length}
- Vouchers: ${data.vouchers.length}
- Carousels: ${data.carousels.length}
- Orders: ${data.orders.length}
- Reviews: ${data.reviews.length}
    `);

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
