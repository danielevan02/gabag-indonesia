import { z } from "zod";
import prisma from "@/lib/prisma";
import { baseProcedure, adminProcedure, createTRPCRouter } from "../init";
import { mediaFileSchema } from "@/lib/schema";

export const galleryRouter = createTRPCRouter({
  getAll: baseProcedure
    .query(async () => {
      try {
        const images = await prisma.mediaFile.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            secure_url: true,
            public_id: true,
          }
        });

        return {
          images
        };
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        return {
          images: []
        };
      }
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const image = await prisma.mediaFile.findUnique({
          where: {
            id: input.id
          }
        });

        return image;
      } catch (error) {
        console.error('Error fetching image:', error);
        return null;
      }
    }),

  create: adminProcedure
    .input(z.array(mediaFileSchema))
    .mutation(async ({ input }) => {
      try {
        await prisma.mediaFile.createMany({
          data: input
        })

        return {
          success: true,
        };
      } catch (error) {
        console.error('Error saving gallery images:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to save images"
        };
      }
    }),

  deleteImages: adminProcedure
    .input(z.object({
      secure_urls: z.array(z.string())
    }))
    .mutation(async ({ input }) => {

      if (input.secure_urls.length === 0) return;

      try {
        const resp = await prisma.mediaFile.deleteMany({
          where: {
            secure_url: {
              in: input.secure_urls
            }
          }
        });

        return {
          status: 200,
          message: `Success delete ${resp.count} images`
        };
      } catch (error) {
        console.log(error);
        return {
          status: 500,
          message: "Failed deleting images"
        };
      }
    })
});