/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { orderSchema } from "@/lib/schema";
import { Address, Areas, CartItem, Rates } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import debounce from "lodash/debounce";
import { CircleAlert, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/actions/user.action";
import { trpc } from "@/trpc/client";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";

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
  const router = useRouter();
  const [area, setArea] = useState<Areas>();
  const [rateList, setRateList] = useState<Rates[]>();
  const userAddress = user?.address as Address;
  const [shipping, setShipping] = useState<{ price: number; courier: string }>();
  const [isLoading, startTransition] = useTransition();
  const [courierLoading, courierTransition] = useTransition();
  const [voucher, setVoucher] = useState("");

  // tRPC utils and mutations
  const utils = trpc.useUtils();
  const makePaymentMutation = trpc.order.makePayment.useMutation();
  const finalizeOrderMutation = trpc.order.finalize.useMutation();
  const updatePaymentStatusMutation = trpc.order.updatePaymentStatus.useMutation();

  let lastPrice = totalPrice;
  if (shipping) {
    lastPrice += shipping.price;
  }

  const form = useForm({
    resolver: zodResolver(orderSchema),
    mode: "onBlur", // Validate on blur
    reValidateMode: "onBlur", // Re-validate on blur after first validation
    criteriaMode: "all", // Show all validation errors
    shouldFocusError: true, // Focus on first error field
    defaultValues: {
      name: user?.name || "",
      address: userAddress?.address || "",
      city: userAddress?.city || "",
      district: userAddress?.district || "",
      phone: user?.phone || "",
      postal_code: userAddress?.postalCode || area?.postal_code || "",
      province: userAddress?.province || "",
      village: userAddress?.village || "",
      email: user?.email || "",
    },
  });

  const debouncedFetch = useMemo(
    () =>
      debounce(async () => {
        try {
          // this is the input for searching location by city and district
          const res = await utils.courier.getMapsAreas.fetch(
            `${form.watch("city")} ${form.watch("district")} ${form.watch("postal_code")}`
          );
          setArea((prev) => (prev === res[0] ? prev : res[0]));
        } catch (error) {
          console.error("Error fetching maps areas:", error);
        }
      }, 1000),
    [form.watch("city"), form.watch("district"), form.watch("postal_code")]
  );

  // FOR SEARCHING AREA
  useEffect(() => {
    const requiredFields: (keyof OrderFormType)[] = [
      "address",
      "city",
      "district",
      "name",
      "postal_code",
      "province",
      "village",
    ];

    const allFilled = requiredFields.every((field) => form.getValues(field)?.length);

    if (allFilled) {
      debouncedFetch();
      return () => debouncedFetch.cancel();
    }
  }, [form.watch("city"), form.watch("district")]);

  // TO GET COURIER RATES AFTER USER COMPLETE IDENTITY
  useEffect(() => {
    // Create the function to fetch
    const fetchCourierRates = async () => {
      courierTransition(async () => {
        const items = cartItem.map((item) => ({
          name: item.name,
          value: item.price,
          quantity: item.qty,
          weight: item.weight || 0,
          height: item.height || 1,
          length: item.length || 1,
          width: item.width || 1,
        }));

        try {
          const res = await utils.courier.getCourierRates.fetch({
            destination_area_id: area?.id || "",
            destination_postal_code: form.getValues("postal_code"),
            items,
          });

          setRateList(res);
        } catch (error) {
          console.error("Error fetching courier rates:", error);
        }
      });
    };

    // RUN THE FETCH FUNCTION IF THERE IS AREA
    if (area) fetchCourierRates();
  }, [area]);

  const onSubmit: SubmitHandler<OrderFormType> = async (data) => {
    if (!shipping || shipping.price === 0) {
      return toast.error("Please choose a courier for your delivery");
    }
    startTransition(async () => {
      const res = await makePaymentMutation.mutateAsync({
        email: data.email || user?.email || "placeholder@mail.com",
        name: data.name || user?.name || "NO_NAME",
        phone: data.phone || user?.phone || "0888888888",
        subTotal: totalPrice,
        userId: user?.id || "",
        shippingPrice: shipping.price,
        orderId,
        taxPrice,
        cartItem,
      });

      if (res?.success && "token" in res && res.token) {
        await finalizeOrderMutation.mutateAsync({
          courier: shipping.courier,
          shippingPrice: shipping.price,
          totalPrice: totalPrice + shipping.price,
          token: res.token,
          itemsPrice,
          orderId,
          taxPrice,
          shippingInfo: {
            postal_code: data.postal_code,
            area_id: area?.id || "",
            email: data.email,
            name: data.name,
            phone: data.phone,
            address: `${data.address}, ${data.village}, ${data.district}, ${data.city}, ${data.province}, ${data.postal_code}`,
          },
        });
        window.snap.pay(res.token, {
          onSuccess: async () => {
            await updatePaymentStatusMutation.mutateAsync({ orderId, paymentStatus: "settlement" });
            router.push("/orders");
          },
        });
      } else {
        toast.error("Payment failed, there is no token");
      }
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
            {rateList ? (
              rateList.length !== 0 && area ? (
                <div className="rounded-md border max-h-60 overflow-scroll">
                  {rateList.map((rate) => {
                    const rateId = `${rate.company}-${rate.type}`;
                    return (
                      <div
                        className={cn(
                          "flex justify-between py-3 px-4 border-b hover:bg-neutral-100 transition-all cursor-pointer",
                          rateId === shipping?.courier && "bg-neutral-200"
                        )}
                        key={rateId}
                        onClick={() => setShipping({ price: rate.price, courier: rateId })}
                      >
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border transition",
                              rateId === shipping?.courier && "border-4 border-foreground"
                            )}
                          />
                          <div className="flex flex-col gap-1 w-40 md:w-auto">
                            <p className="text-xs">
                              {rate.courier_name} - {rate.courier_service_name}
                            </p>
                            {rate.duration && (
                              <p className="text-neutral-500 text-xs">{rate.duration}</p>
                            )}
                            <p className="text-xs text-neutral-500">
                              Sending from TANGERANG to{" "}
                              <span className="uppercase">
                                {area?.administrative_division_level_2_name}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm">Rp {rate.price.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 bg-red-100 border border-red-400 flex rounded-md gap-2">
                  <CircleAlert className="w-10 h-fit text-red-400" />
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-sm">Shipping not available</p>
                    <p className="text-xs">
                      Your order cannot be shipped to the selected address. Review your address to
                      ensure it&apos;s correct and try again, or select a different address.
                    </p>
                  </div>
                </div>
              )
            ) : courierLoading ? (
              <Skeleton className="rounded-md w-full h-14" />
            ) : (
              <div className="py-5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs text-center text-neutral-500 dark:text-neutral-300">
                Enter your shipping address to view available shipping methods.
              </div>
            )}
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
      <div className="block lg:sticky top-36 right-0 overflow-hidden flex-1 lg:max-w-lg p-5 h-fit">
        <h2 className="font-semibold text-lg mb-5">Your Cart</h2>

        <div className="flex flex-col gap-3 max-h-72 overflow-scroll pt-1">
          {cartItem.map((item, index) => (
            <div className="flex gap-2 justify-between" key={index}>
              <div className="w-16 h-16 rounded-md relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  height={100}
                  width={100}
                  className="h-full w-full object-cover rounded-md"
                />
                <p className="absolute -top-1 -right-1 bg-neutral-500 px-1 rounded-full text-white text-xs">
                  {item.qty}
                </p>
              </div>
              <div className="flex flex-col max-w-72 justify-between flex-1">
                <h2 className="text-sm mb-auto line-clamp-2">{item.name}</h2>
                <p className="text-xs ">Rp {item.price.toLocaleString()}</p>
              </div>
              <p className="text-sm font-medium">Rp {(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Input
              value={voucher}
              placeholder="Input your voucher here"
              onChange={(e) => setVoucher(e.target.value)}
            />
            <Button>Apply Voucher</Button>
          </div>
          <div className="flex justify-between">
            <p className="text-sm">Subtotal</p>
            <p className="text-sm">Rp {itemsPrice.toLocaleString()}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm">Tax Price</p>
            <p className="text-sm">Rp {taxPrice.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm">Shipping</p>
            {shipping && shipping.price !== 0 ? (
              <p className="text-sm">Rp {shipping.price.toLocaleString()}</p>
            ) : (
              <p className="text-xs text-neutral-500">Enter shipping address</p>
            )}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-2xl font-semibold">Rp {lastPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderForm;
