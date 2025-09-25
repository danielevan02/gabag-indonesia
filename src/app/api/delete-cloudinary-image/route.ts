import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { publicId } = body;
    
    if (!publicId) {
      return Response.json({ error: "Public ID is required" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return Response.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return Response.json(
      { error: "Failed to delete image from Cloudinary" },
      { status: 500 }
    );
  }
}