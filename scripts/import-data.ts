import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('🚀 Starting data import...');

    // Read backup file
    const data = JSON.parse(
      fs.readFileSync('database-backup.json', 'utf-8')
    );

    console.log('⚠️  WARNING: This will clear existing data!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Clear existing data (in correct order due to foreign keys)
    console.log('🗑️  Clearing existing data...');
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.campaignItem.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.voucher.deleteMany();
    await prisma.variant.deleteMany();
    await prisma.productMediaRelation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.carousel.deleteMany();
    await prisma.mediaFile.deleteMany();
    await prisma.user.deleteMany();

    console.log('📥 Importing data...');

    // Track created MediaFiles to avoid duplicates
    const mediaFileMap = new Map<string, string>(); // old ID -> new ID

    // Import in correct order

    // 1. Users
    if (data.users?.length > 0) {
      for (const user of data.users) {
        await prisma.user.create({ data: user });
      }
      console.log(`✅ Imported ${data.users.length} users`);
    }

    // Helper function to create or reuse MediaFile
    const getOrCreateMediaFile = async (mediaFile: any) => {
      if (!mediaFile) return null;

      const oldId = mediaFile.id;

      // Check if already created
      if (mediaFileMap.has(oldId)) {
        return mediaFileMap.get(oldId)!;
      }

      // Create new MediaFile
      const { id, ...mediaFileData } = mediaFile;
      const created = await prisma.mediaFile.create({
        data: mediaFileData
      });

      // Track mapping
      mediaFileMap.set(oldId, created.id);
      return created.id;
    };

    // 2. Categories
    if (data.categories?.length > 0) {
      for (const category of data.categories) {
        const { mediaFile, ...categoryData } = category;

        // Get or create media file
        const mediaFileId = await getOrCreateMediaFile(mediaFile);

        // Create category with mediaFile reference
        await prisma.category.create({
          data: {
            ...categoryData,
            mediaFileId
          }
        });
      }
      console.log(`✅ Imported ${data.categories.length} categories`);
    }

    // 3. SubCategories
    if (data.subCategories?.length > 0) {
      for (const subCategory of data.subCategories) {
        const { mediaFile, ...subCategoryData } = subCategory;

        const mediaFileId = await getOrCreateMediaFile(mediaFile);

        await prisma.subCategory.create({
          data: {
            ...subCategoryData,
            mediaFileId
          }
        });
      }
      console.log(`✅ Imported ${data.subCategories.length} sub-categories`);
    }

    // 4. Products with images
    if (data.products?.length > 0) {
      for (const product of data.products) {
        const { images, variants, ...productData } = product;

        // Create product
        const createdProduct = await prisma.product.create({
          data: productData
        });

        // Create images
        if (images?.length > 0) {
          for (const image of images) {
            const { mediaFile, ...imageData } = image;

            // Get or create media file
            const mediaFileId = await getOrCreateMediaFile(mediaFile);

            // Create product media relation
            await prisma.productMediaRelation.create({
              data: {
                ...imageData,
                mediaFileId: mediaFileId!,
                productId: createdProduct.id
              }
            });
          }
        }

        // Create variants
        if (variants?.length > 0) {
          for (const variant of variants) {
            const { mediaFile, ...variantData } = variant;

            // Get or create media file for variant
            const mediaFileId = await getOrCreateMediaFile(mediaFile);

            await prisma.variant.create({
              data: {
                ...variantData,
                productId: createdProduct.id,
                mediaFileId: mediaFileId!
              }
            });
          }
        }
      }
      console.log(`✅ Imported ${data.products.length} products`);
    }

    // 5. Campaigns
    if (data.campaigns?.length > 0) {
      for (const campaign of data.campaigns) {
        const { items, ...campaignData } = campaign;

        const createdCampaign = await prisma.campaign.create({
          data: campaignData
        });

        if (items?.length > 0) {
          for (const item of items) {
            await prisma.campaignItem.create({
              data: {
                ...item,
                campaignId: createdCampaign.id
              }
            });
          }
        }
      }
      console.log(`✅ Imported ${data.campaigns.length} campaigns`);
    }

    // 6. Vouchers
    if (data.vouchers?.length > 0) {
      for (const voucher of data.vouchers) {
        await prisma.voucher.create({ data: voucher });
      }
      console.log(`✅ Imported ${data.vouchers.length} vouchers`);
    }

    // 7. Carousels
    if (data.carousels?.length > 0) {
      for (const carousel of data.carousels) {
        const { desktopImage, mobileImage, ...carouselData } = carousel;

        // Get or create media files
        const desktopImageId = await getOrCreateMediaFile(desktopImage);
        const mobileImageId = await getOrCreateMediaFile(mobileImage);

        // Create carousel with image references
        await prisma.carousel.create({
          data: {
            ...carouselData,
            desktopImageId: desktopImageId!,
            mobileImageId: mobileImageId!
          }
        });
      }
      console.log(`✅ Imported ${data.carousels.length} carousels`);
    }

    // 8. Orders
    if (data.orders?.length > 0) {
      for (const order of data.orders) {
        const { orderItems, ...orderData } = order;

        const createdOrder = await prisma.order.create({
          data: orderData
        });

        if (orderItems?.length > 0) {
          for (const item of orderItems) {
            await prisma.orderItem.create({
              data: {
                ...item,
                orderId: createdOrder.id
              }
            });
          }
        }
      }
      console.log(`✅ Imported ${data.orders.length} orders`);
    }

    // 9. Reviews
    if (data.reviews?.length > 0) {
      for (const review of data.reviews) {
        await prisma.review.create({ data: review });
      }
      console.log(`✅ Imported ${data.reviews.length} reviews`);
    }

    console.log('✅ Data import completed successfully!');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
