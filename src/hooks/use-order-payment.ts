import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { trpc } from "@/trpc/client";

interface UseOrderPaymentProps {
  orderId: string;
}

interface ProcessPaymentParams {
  email: string;
  name: string;
  phone: string;
  userId: string;
  totalPrice: number;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  courier: string;
  cartItems: CartItem[];
  shippingInfo: {
    postal_code: string;
    area_id: string;
    email: string;
    name: string;
    phone: string;
    address: string;
  };
}

export const useOrderPayment = ({ orderId }: UseOrderPaymentProps) => {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();

  const makePaymentMutation = trpc.order.makePayment.useMutation();
  const finalizeOrderMutation = trpc.order.finalize.useMutation();
  const updatePaymentStatusMutation = trpc.order.updatePaymentStatus.useMutation();

  const processPayment = async ({
    email,
    name,
    phone,
    userId,
    totalPrice,
    itemsPrice,
    taxPrice,
    shippingPrice,
    courier,
    cartItems,
    shippingInfo,
  }: ProcessPaymentParams) => {
    startTransition(async () => {
      try {
        const res = await makePaymentMutation.mutateAsync({
          email,
          name,
          phone,
          subTotal: totalPrice,
          userId,
          shippingPrice,
          orderId,
          taxPrice,
          cartItem: cartItems,
        });

        if (res?.success && "token" in res && res.token) {
          await finalizeOrderMutation.mutateAsync({
            courier,
            shippingPrice,
            totalPrice: totalPrice + shippingPrice,
            token: res.token,
            itemsPrice,
            orderId,
            taxPrice,
            shippingInfo,
          });

          window.snap.pay(res.token, {
            onSuccess: async () => {
              await updatePaymentStatusMutation.mutateAsync({
                orderId,
                paymentStatus: "settlement",
              });
              router.push("/orders");
            },
          });
        } else {
          toast.error("Payment failed, there is no token");
        }
      } catch (error) {
        console.error("Payment processing error:", error);
        toast.error("Payment failed. Please try again.");
      }
    });
  };

  return { processPayment, isLoading };
};