"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";
import { trpc } from "@/trpc/client";
import { useSession } from "next-auth/react";
import { getCurrentUser } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";

const ImageForm = ({ user }: { user: Awaited<ReturnType<typeof getCurrentUser>> }) => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const router = useRouter();
  const { update: updateSession } = useSession();
  const { mutateAsync: updateProfile, isPending: isLoading } =
    trpc.auth.updateProfile.useMutation();

  const handleUploadSuccess = async (result: any) => {
    const newImageUrl = result.info.secure_url;

    // Delete old image from Cloudinary if exists
    if (user?.image && user.image.includes("cloudinary.com")) {
      try {
        const publicId = extractPublicId(user.image);
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    // Update profile with new image
    if (!user?.id) return;
    const profileRes = await updateProfile({ image: newImageUrl, userId: user.id });

    if (profileRes?.success) {
      setUploadedImageUrl(newImageUrl);
      toast.success(profileRes.message as string);

      // Update session with new image
      await updateSession();

      // Refresh server components (Header) to show new image
      router.refresh();
    } else {
      toast.error(profileRes?.message as string);
    }
  };

  const extractPublicId = (url: string): string => {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\./;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const deleteFromCloudinary = async (publicId: string) => {
    await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="relative rounded-full w-1/2 min-w-72 aspect-square overflow-hidden">
        <Image
          src={uploadedImageUrl || user?.image || "/images/user-placeholder.png"}
          alt={user?.name || "User Profile"}
          width={200}
          height={200}
          className="w-full h-full object-cover"
        />

        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/70 flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="w-56">
        <CldUploadWidget
          options={{
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxImageFileSize: 10000000, // 10MB
            folder: "profile-images",
          }}
          signatureEndpoint="/api/sign-cloudinary-params"
          onSuccess={handleUploadSuccess}
          onError={(error) => {
            toast.error("Upload failed. Please try again.");
            console.error("Upload error:", error);
          }}
        >
          {({ open }) => (
            <Button
              className="tracking-widest w-full "
              variant="outline"
              onClick={() => open()}
              disabled={isLoading}
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              Change Profile Picture
            </Button>
          )}
        </CldUploadWidget>
      </div>
    </div>
  );
};

export default ImageForm;
