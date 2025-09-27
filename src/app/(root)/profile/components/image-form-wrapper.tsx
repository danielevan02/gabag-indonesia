"use client";

import { SessionProvider } from "next-auth/react";
import ImageForm from "./image-form";
import { getCurrentUser } from "@/lib/actions/user.action";

interface ImageFormWrapperProps {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
}

const ImageFormWrapper = ({ user }: ImageFormWrapperProps) => {
  return (
    // @ts-expect-error React 19 compatibility issue with next-auth
    <SessionProvider>
      <ImageForm user={user} />
    </SessionProvider>
  );
};

export default ImageFormWrapper;