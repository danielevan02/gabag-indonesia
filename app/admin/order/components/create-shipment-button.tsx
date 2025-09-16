"use client";

import LoadingComponent from "@/components/shared/loading-component";
import { Button } from "@/components/ui/button";
import { createBiteshipOrder } from "@/lib/actions/courier.action";
import { ShippingInfo } from "@/types";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type ShipmentType = {
  shippingInfo: ShippingInfo;
  courier: string;
  orderId: string;
};

export default function CreateShipmentButton({ shippingInfo, courier, orderId }: ShipmentType) {
  const [loading, setLoading] = useState(false);
  if (!shippingInfo || !courier) return;

  const handleShipment = async () => {
    try {
      setLoading(true);
      await createBiteshipOrder({courier, orderId, shippingInfo})
      toast.success("Shipment created");
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Failed creating shipment");
    }
  };
  return (
    <>
      <Button onClick={handleShipment} disabled={loading}>
        {loading ? <Loader className="animate-spin size-4" /> : "Create Shipment"}
      </Button>
      {loading && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
          <LoadingComponent />
        </div>
      )}
    </>
  );
}
