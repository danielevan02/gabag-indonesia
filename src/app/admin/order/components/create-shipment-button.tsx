"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { ShippingInfo } from "@/types";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export type ShipmentType = {
  shippingInfo: ShippingInfo;
  courier: string;
  orderId: string;
};

export default function CreateShipmentButton({ shippingInfo, courier, orderId }: ShipmentType) {
  const { mutateAsync, isPending } = trpc.courier.createShipment.useMutation({
    onSuccess: () => {
      toast.success("Shipment created");
    },
  });

  if (!shippingInfo || !courier) return null;

  const handleShipment = async () => {
    try {
      await mutateAsync({ courier, orderId, shippingInfo });
    } catch (error) {
      console.error(error);
      toast.error("Failed creating shipment");
    }
  };

  return (
    <Button onClick={handleShipment} disabled={isPending}>
      {isPending ? <Loader className="animate-spin size-4" /> : "Create Shipment"}
    </Button>
  );
}
