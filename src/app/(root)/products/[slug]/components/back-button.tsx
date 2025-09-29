"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const BackButton = () => {
  const router = useRouter()
  return (
    <Button className="rounded-full" variant="outline" onClick={()=>router.back()}>
      <ArrowLeft /> Back to product list
    </Button>
  );
};
