"use client";

import { Button } from "@/components/ui/button";
import { orderSchema } from "@/lib/schema";
import { Address, CartItem } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Loader } from "lucide-react";
import Script from "next/script";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/actions/user.action";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";
import { useAreaSearch } from "@/hooks/use-area-search";
import { useCourierRates } from "@/hooks/use-courier-rates";
import { useOrderPayment } from "@/hooks/use-order-payment";
import { ShippingMethodList } from "./shipping/shipping-method-list";
import { OrderSummary } from "./order-summary";
import { DEFAULT_EMAIL, DEFAULT_NAME, DEFAULT_PHONE, REQUIRED_ORDER_FIELDS } from "@/lib/constants";

declare global {
  interface Window {
    snap: any;
  }
}

export type OrderFormType = z.infer<typeof orderSchema>;

interface OrderFormProps {
  user?: Awaited<ReturnType<typeof getCurrentUser>>;
  cartItem: CartItem[];
  itemsPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderId: string;
}

const OrderForm: React.FC<OrderFormProps> = ({
  user,
  cartItem,
  itemsPrice,
  taxPrice,
  totalPrice,
  orderId,
}) => {
  const userAddress = user?.address as Address;
  const [shipping, setShipping] = useState<{ price: number; courier: string }>();

  const form = useForm({
    resolver: zodResolver(orderSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues: {
      name: user?.name || "",
      address: userAddress?.address || "",
      city: userAddress?.city || "",
      district: userAddress?.district || "",
      phone: user?.phone || "",
      postal_code: userAddress?.postalCode || "",
      province: userAddress?.province || "",
      village: userAddress?.village || "",
      email: user?.email || "",
    },
  });

  // Watch form values for area search
  const city = form.watch("city");
  const district = form.watch("district");
  const postalCode = form.watch("postal_code");

  // Check if all required fields are filled
  const allFieldsFilled = REQUIRED_ORDER_FIELDS.every((field) => {
    const value = form.getValues(field);
    return value && value.length > 0;
  });

  // Custom hooks for business logic
  const { area } = useAreaSearch({
    city,
    district,
    postalCode,
    enabled: allFieldsFilled,
  });

  // Auto-fill postal code from area if user hasn't entered one
  useEffect(() => {
    if (area?.postal_code && !form.getValues("postal_code")) {
      form.setValue("postal_code", area.postal_code);
    }
  }, [area, form]);

  const { rateList, isLoading: courierLoading } = useCourierRates({
    areaId: area?.id,
    postalCode: postalCode || area?.postal_code || "",
    cartItems: cartItem,
    enabled: !!area,
  });

  const { processPayment, isLoading } = useOrderPayment({ orderId });

  // Calculate final price
  const finalPrice = totalPrice + (shipping?.price || 0);

  // Handler functions
  const handleSelectCourier = (courier: string, price: number) => {
    setShipping({ courier, price });
  };

  const onSubmit: SubmitHandler<OrderFormType> = async (data) => {
    if (!shipping || shipping.price === 0) {
      return toast.error("Please choose a courier for your delivery");
    }

    if (!area?.id) {
      return toast.error("Invalid shipping area");
    }

    await processPayment({
      email: data.email || user?.email || DEFAULT_EMAIL,
      name: data.name || user?.name || DEFAULT_NAME,
      phone: data.phone || user?.phone || DEFAULT_PHONE,
      userId: user?.id || "",
      totalPrice,
      itemsPrice,
      taxPrice,
      shippingPrice: shipping.price,
      courier: shipping.courier,
      cartItems: cartItem,
      shippingInfo: {
        postal_code: data.postal_code,
        area_id: area.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: `${data.address}, ${data.village}, ${data.district}, ${data.city}, ${data.province}, ${data.postal_code}`,
      },
    });
  };

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_UI}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 py-5 px-1 md:px-5 overflow-hidden lg:max-w-xl flex flex-col gap-4 lg:border-r-1"
        >
          <div className="flex flex-col gap-5 ">
            <h3 className="text-lg font-semibold">Delivery</h3>
            <div className="flex justify-between gap-3 flex-col md:flex-row">
              <FormInput
                form={form}
                name="email"
                fieldType="text"
                label="Email"
                placeholder="enter your email..."
                className="flex-1"
              />
              <FormInput
                form={form}
                name="name"
                fieldType="text"
                label="Full Name"
                placeholder="enter your full name..."
                className="flex-1"
              />
            </div>
            <div className="flex justify-between gap-3 flex-col md:flex-row">
              <FormInput
                form={form}
                name="province"
                fieldType="text"
                label="Province"
                placeholder="enter your province..."
                className="flex-1"
              />
              <FormInput
                form={form}
                name="village"
                fieldType="text"
                label="Village (Kelurahan)"
                placeholder="enter your village..."
                className="flex-1"
              />
            </div>
            <div className="flex gap-3 justify-between flex-col md:flex-row">
              <FormInput
                form={form}
                name="postal_code"
                fieldType="text"
                label="Postal Code"
                placeholder="enter your postal code..."
                className="flex-1"
              />
              <FormInput
                form={form}
                name="phone"
                fieldType="phone"
                label="Phone"
                placeholder="enter your phone..."
                className="flex-1"
              />
            </div>
            <FormInput
              form={form}
              name="address"
              fieldType="textarea"
              label="Address"
              placeholder="Enter your address"
            />
            <FormInput
              form={form}
              name="city"
              fieldType="text"
              label="City"
              placeholder="enter your city..."
            />
            <FormInput
              form={form}
              name="district"
              fieldType="text"
              label="District (Kecamatan)"
              placeholder="enter your district..."
            />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-3">Shipping Method</h3>
            <ShippingMethodList
              rateList={rateList}
              area={area}
              isLoading={courierLoading}
              selectedCourier={shipping?.courier}
              onSelectCourier={handleSelectCourier}
            />
          </div>
          <Button
            className="uppercase text-xs tracking-widest rounded-full py-7"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : "Proceed to payment"}
          </Button>
        </form>
      </Form>
      <OrderSummary
        cartItems={cartItem}
        itemsPrice={itemsPrice}
        taxPrice={taxPrice}
        shippingPrice={shipping?.price}
        totalPrice={finalPrice}
      />
    </>
  );
};

export default OrderForm;