"use client";

import { SessionProvider } from "next-auth/react";
import ImageForm from "./image-form";
import { getCurrentUser } from "@/lib/actions/user.action";

interface ImageFormWrapperProps {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
}

const ImageFormWrapper = ({ user }: ImageFormWrapperProps) => {
  return (
    <SessionProvider>
      <ImageForm user={user} />
    </SessionProvider>
  );
};

export default ImageFormWrapper;