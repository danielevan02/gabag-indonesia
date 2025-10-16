"use client";

import ImageForm from "./image-form";
import { getCurrentUser } from "@/lib/actions/user.action";

interface ImageFormWrapperProps {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
}

const ImageFormWrapper = ({ user }: ImageFormWrapperProps) => {
  return <ImageForm user={user} />;
};

export default ImageFormWrapper;