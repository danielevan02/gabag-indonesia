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

        let res;
        let hasError = false;

        try {
          res = await makePaymentMutation.mutateAsync({
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
        } catch (mutationError: any) {
          hasError = true;

          // Extract error message from TRPC mutation error
          const errorMessage = mutationError?.message || mutationError?.data?.message || mutationError?.shape?.message || "Payment failed. Please try again.";

          // Check if error is about price change
          if (errorMessage.includes("perubahan campaign")) {
            toast.error("Harga produk telah berubah. Halaman akan di-refresh...", {
              duration: 3000,
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else if (errorMessage.includes("Stock campaign") || errorMessage.includes("tidak mencukupi")) {
            // Campaign stock limit error - show user-friendly message
            toast.error("Sorry, the limit for this product have been exceeded. Try other product", {
              duration: 5000,
            });
          } else {
            // Generic error
            toast.error(errorMessage);
          }

          // Stop execution here - don't continue to finalize
          return;
        }

        // Only proceed if no error occurred
        if (hasError) return;

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
      } catch (error: any) {
        // This catch block handles errors from finalize or updatePaymentStatus mutations
        console.error("Payment processing error:", error);

        const errorMessage = error?.message || error?.data?.message || "Payment processing failed. Please try again.";
        toast.error(errorMessage);
      }
    });
  };

  return { processPayment, isLoading };
};