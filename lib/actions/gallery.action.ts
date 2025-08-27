'use server';

import { prisma } from "../db/prisma";
import { revalidatePath } from "next/cache";

export async function getGalleryImages() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      images: images.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        createdAt: img.createdAt.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return {
      success: false,
      message: "Failed to fetch images"
    };
  }
}

export async function saveGalleryImages(imageUrls: string[]) {
  try {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('No image URLs provided');
    }

    console.log('Saving gallery images:', imageUrls);

    const images = await Promise.all(
      imageUrls.map(async (url) => {
        if (!url) {
          throw new Error('Invalid image URL');
        }
        return prisma.galleryImage.create({
          data: { imageUrl: url }
        });
      })
    );

    console.log('Successfully saved images:', images);

    revalidatePath('/admin/catalog/product/add');
    
    return {
      success: true,
      images: images.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        createdAt: img.createdAt.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error saving gallery images:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save images"
    };
  }
}