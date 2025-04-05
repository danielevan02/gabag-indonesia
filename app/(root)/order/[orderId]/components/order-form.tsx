/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import Image from "next/image";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orderSchema } from "@/lib/schema";
import { Address, Areas, CartItem, Rates } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  SubmitHandler,
  useForm,
  UseFormRegisterReturn,
  Controller,
  Control,
  FieldError,
  UseFormTrigger,
} from "react-hook-form";
import { z } from "zod";
import lodash from "lodash";
import { finalizeOrder, getMapsId, makePayment } from "@/lib/actions/order.action";
import { getCourierRates } from "@/lib/actions/courier.action";
import { CircleAlert, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

declare global {
  interface Window{
    snap: any
  }
}

type OrderFormType = z.infer<typeof orderSchema>;

interface OrderFormProps {
  user?: User;
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
  orderId
}) => {
  const router = useRouter();
  const [area, setArea] = useState<Areas>();
  const [rateList, setRateList] = useState<Rates[]>();
  const userAddress = user?.address as Address;
  const [shipping, setShipping] = useState<{ price: number; courier: string }>();
  const [isLoading, startTransition] = useTransition();

  let lastPrice = totalPrice;
  if (shipping) {
    lastPrice += shipping.price;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    getValues,
    trigger,
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: user?.name ?? "",
      address: userAddress.address ?? "",
      city: userAddress.city ?? "",
      district: userAddress.district ?? "",
      phone: "",
      postal_code: userAddress.postalCode || area?.postal_code || "",
      province: userAddress.province,
      village: userAddress.village ?? "",
      email: user?.email ?? "",
    },
  });

  const debouncedFetch = useMemo(
    () =>
      lodash.debounce(async () => {
        const res = await getMapsId(
          // this is the input for searching location by city and district
          watch("city") + " " + watch("district")
        );
        setArea((prev) => (prev === res[0] ? prev : res[0]));
      }, 1000),
    [watch("city"), watch("district")]
  );

  // FOR SEARCHING AREA
  useEffect(() => {
    if (
      getValues("address").length !== 0 &&
      getValues("city").length !== 0 &&
      getValues("district").length !== 0 &&
      getValues("name").length !== 0 &&
      getValues("postal_code").length !== 0 &&
      getValues("province").length !== 0 &&
      getValues("village").length !== 0
    ) {
      debouncedFetch();

      return () => debouncedFetch.cancel();
    }
  }, [watch("city"), watch("district")]);

  // TO GET COURIER RATES AFTER USER COMPLETE IDENTITY
  useEffect(() => {
    // Create the function to fetch
    const fetchCourierRates = async () => {
      const items = cartItem.map((item) => ({
        name: item.name,
        value: item.price,
        quantity: item.qty,
        weight: item.weight || 0,
      }));

      try {
        const res = await getCourierRates({
          destination_area_id: area?.id || "",
          destination_postal_code: getValues("postal_code"),
          items,
        });

        setRateList(res);
      } catch (error) {
        console.error("Error fetching courier rates:", error);
      }
    };

    // RUN THE FETCH FUNCTION IF THERE IS AREA
    if (area) fetchCourierRates();
  }, [area]);

  // FOR MIDTRANS VIEW
  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

    const script = document.createElement("script");
    script.src = midtransScriptUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onSubmit: SubmitHandler<OrderFormType> = async (data) => {
    if (!shipping || shipping.price === 0) {
      return toast.error("Please choose a courier for your delivery");
    }
    startTransition(async () => {
      const token = await makePayment({
        email: data.email || user?.email || "placeholder@mail.com",
        name: data.name || user?.name || "NO_NAME",
        phone: data.phone || user?.phone || "0888888888",
        subTotal: totalPrice,
        userId: user?.id || "",
        orderId,
        taxPrice,
        cartItem,
        shippingPrice: shipping.price
      });

      if (token) {
        window.snap.pay(token, {
          onSuccess: async () => {
            toast.success("Payment successful");
            await finalizeOrder({
              courier: shipping.courier,
              isPaid: true,
              itemsPrice,
              orderId,
              paymentStatus: 'success',
              shippingPrice: shipping.price,
              taxPrice,
              token,
              totalPrice: totalPrice + shipping.price,
              shippingInfo: {
                postal_code: data.postal_code,
                area_id: area?.id||"",
                email: data.email,
                name: data.name,
                phone: data.phone,
                address: `${data.address}, ${data.village}, ${data.district}, ${data.city}, ${data.province}, ${data.postal_code}`
              }
            })
            router.push("/order");
          },
        });
      } else {
        toast.error("Payment failed, there is no token");
      }
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 p-5 overflow-hidden lg:max-w-xl flex flex-col gap-4 lg:border-r-1"
      >
        <div className="flex flex-col gap-5 ">
          <h3 className="text-lg font-semibold">Delivery</h3>
          <InputForm
            label="Email"
            placeholder="enter your email..."
            htmlFor="email"
            register={register("email")}
            errors={errors.email}
            trigger={trigger}
          />
          <InputForm
            label="Full Name"
            placeholder="enter your full name..."
            htmlFor="name"
            register={register("name")}
            errors={errors.name}
            trigger={trigger}
          />
          <InputForm
            label="Province"
            placeholder="enter your province..."
            htmlFor="province"
            register={register("province")}
            errors={errors.province}
            trigger={trigger}
          />
          <InputForm
            label="Village (Kelurahan)"
            placeholder="enter your village..."
            htmlFor="village"
            register={register("village")}
            errors={errors.village}
            trigger={trigger}
          />
          <div className="flex gap-5 flex-col md:flex-row">
            <InputForm
              label="postal code"
              placeholder="enter your postal code..."
              htmlFor="postal_code"
              register={register("postal_code")}
              errors={errors.postal_code}
              trigger={trigger}
            />
            <InputForm
              label="phone"
              placeholder="enter your phone..."
              htmlFor="phone"
              type="phone"
              register={register("phone")}
              control={control}
              errors={errors.phone}
              trigger={trigger}
            />
          </div>
          <InputForm
            label="Address"
            placeholder="Enter your address"
            htmlFor="address"
            type="textarea"
            register={register("address")}
            errors={errors.address}
            trigger={trigger}
          />
          <InputForm
            label="City"
            placeholder="enter your city..."
            htmlFor="city"
            register={register("city")}
            errors={errors.city}
            trigger={trigger}
          />
          <InputForm
            label="District (Kecamatan)"
            placeholder="enter your district..."
            htmlFor="district"
            register={register("district")}
            errors={errors.district}
            trigger={trigger}
          />
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Shipping Method</h3>
          {rateList ? (
            rateList.length !== 0 ? (
              <div className="rounded-md border max-h-60 overflow-scroll">
                {rateList.map((rate) => {
                  const rateId = `${rate.company}-${rate.type}`;
                  return (
                    <div
                      className={cn("flex justify-between py-3 px-4 border-b hover:bg-neutral-100 transition-all cursor-pointer", rateId === shipping?.courier && "bg-neutral-200")}
                      key={rateId}
                      onClick={() => setShipping({ price: rate.price, courier: rateId })}
                    >
                      <div className="flex gap-3">
                        <div className={cn("w-4 h-4 rounded-full border transition", rateId === shipping?.courier && "border-4 border-foreground")}/>
                        <div className="flex flex-col">
                          <p className="text-sm">
                            {rate.courier_name} - {rate.courier_service_name}
                          </p>
                          {rate.duration && (
                            <p className="text-neutral-500 text-sm">{rate.duration}</p>
                          )}
                          <p className="text-sm text-neutral-500">
                            Sending from KALIDERES to {area?.administrative_division_level_2_name}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">Rp {rate.price.toLocaleString()}</p>
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
                <h2 className="text-sm mb-auto">{item.name}</h2>
                <p className="text-xs ">Rp {item.price.toLocaleString()}</p>
              </div>
              <p className="text-sm">Rp {(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-5">
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

interface InputFormProps {
  label: string;
  placeholder: string;
  htmlFor: keyof OrderFormType;
  type?: React.HTMLInputTypeAttribute;
  register: UseFormRegisterReturn;
  control?: Control<OrderFormType>;
  errors?: FieldError;
  trigger: UseFormTrigger<OrderFormType>;
}

const InputForm = ({
  label,
  placeholder,
  type,
  htmlFor,
  register,
  control,
  errors,
  trigger,
}: InputFormProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label className="text-xs uppercase" htmlFor={htmlFor}>
        {label}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={htmlFor}
          placeholder={placeholder}
          className="shadow-none"
          {...register}
          onBlur={() => trigger(htmlFor)}
        />
      ) : type === "phone" ? (
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              international
              className="border rounded-md p-2 dark:bg-neutral-900"
              defaultCountry="ID"
              autoComplete="phone"
              value={field.value}
              onChange={field.onChange}
              onBlur={() => trigger(htmlFor)}
            />
          )}
        />
      ) : (
        <Input
          id={htmlFor}
          placeholder={placeholder}
          className="shadow-none p-5"
          type={type}
          {...register}
          onBlur={() => trigger(htmlFor)}
        />
      )}
      {errors?.message && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <CircleAlert className="w-4 h-4" />
          {errors.message}
        </p>
      )}
    </div>
  );
};
