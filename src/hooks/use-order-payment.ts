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
  voucherCode?: string;
  voucherCodes?: string[];
  discountAmount?: number;
}

export const useOrderPayment = ({ orderId }: UseOrderPaymentProps) => {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const utils = trpc.useUtils();

  const makePaymentMutation = trpc.order.makePayment.useMutation();
  const finalizeOrderMutation = trpc.order.finalize.useMutation({
    onSuccess: () => {
      // Invalidate cart query to update UI immediately
      utils.cart.getMyCart.invalidate();
    },
  });
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
    voucherCode,
    voucherCodes,
    discountAmount,
  }: ProcessPaymentParams) => {
    startTransition(async () => {
      try {
        // Calculate final total with discount
        const finalTotal = totalPrice + shippingPrice - (discountAmount || 0);

        const res = await makePaymentMutation.mutateAsync({
          email,
          name,
          phone,
          subTotal: finalTotal,
          userId,
          shippingPrice,
          orderId,
          taxPrice,
          cartItem: cartItems,
          discountAmount,
          voucherCode,
          voucherCodes,
        });

        if (res?.success && "token" in res && res.token) {
          await finalizeOrderMutation.mutateAsync({
            courier,
            shippingPrice,
            totalPrice: finalTotal,
            token: res.token,
            itemsPrice,
            orderId,
            taxPrice,
            shippingInfo,
            voucherCode,
            voucherCodes,
            discountAmount,
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
        // Extract error message from tRPC error or regular Error
        let errorMessage = "Payment failed. Please try again.";

        // Handle tRPC error format (can be in error.message or error.shape.message)
        if (error && typeof error === "object") {
          // Try to extract message from different possible locations
          const err = error as any;

          if ("message" in error && typeof err.message === "string") {
            errorMessage = err.message;
          } else if (err.shape && err.shape.message) {
            errorMessage = err.shape.message;
          } else if (err.data && err.data.message) {
            errorMessage = err.data.message;
          }

          // Check if error is about price change
          if (errorMessage.includes("perubahan campaign")) {
            toast.error(errorMessage + " Halaman akan di-refresh...", {
              duration: 3000,
            });

            // Reload after 2 seconds
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            return;
          }

          // Handle voucher-specific errors with user-friendly messages
          if (errorMessage.includes("Voucher") || errorMessage.includes("voucher")) {
            // Already has good message from backend
            toast.error(errorMessage);
            return;
          }

          // Handle limit exceeded errors
          if (errorMessage.includes("limit") || errorMessage.includes("reached") || errorMessage.includes("exceeded")) {
            toast.error(errorMessage);
            return;
          }
        }

        // Generic error fallback
        toast.error(errorMessage);
      }
    });
  };

  return { processPayment, isLoading };
};