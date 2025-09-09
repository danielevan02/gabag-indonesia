'use server';

import prisma from "../db/prisma";
import { revalidatePath } from "next/cache";

export async function  getGalleryImages() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      images
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
      images
    };
  } catch (error) {
    console.error('Error saving gallery images:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save images"
    };
  }
}

export async function deleteGalleryImages(imageUrls: string[]) {
  if(imageUrls.length===0) return
  try {
    const resp = await prisma.galleryImage.deleteMany({
      where: {
        imageUrl: {
          in: imageUrls
        }
      }
    })

    revalidatePath('/admin/gallery')

    return {
      status: 200,
      message: `Success delete ${resp.count} images`
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      message: "Failed deleting images"
    }
  }
}