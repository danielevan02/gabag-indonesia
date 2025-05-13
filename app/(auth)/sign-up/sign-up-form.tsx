"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/schema";
import { defaultSignUp } from "@/lib/defaultValues";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import Link from "next/link";
import { registerUser } from "@/lib/actions/user.action";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/shared/input/form-field";

export type SignUpType = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const [email, setEmail] = useState('') 
  const [isLoading, startTransition] = useTransition()
  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      ...defaultSignUp,
      phone: defaultSignUp.phone.slice(3)
    },
  });

  const onSubmit: SubmitHandler<SignUpType> = async (data) => {
    startTransition(async()=>{
      const res = await registerUser(data)
      
      if(!res.success){
        toast.error(res.message as string)
      } else {
        setEmail(data.email)
      }
    })
  };

  return !email ? (
    <form className="flex flex-col px-1" onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Full Name"
        name="fullName"
        errors={errors}
        placeholder="Enter your name..."
        type="text"
        register={register}
      />

      <FormField
        label="Email"
        name="email"
        errors={errors}
        placeholder="Enter your email..."
        type="email"
        register={register}
      />

      <FormField
        label="Phone"
        name="phone"
        errors={errors}
        placeholder="Enter your phone number..."
        register={register}
        control={control}
      />

      <FormField
        label="Password"
        name="password"
        errors={errors}
        placeholder="Enter your password..."
        register={register}
      />

      <FormField
        label="Confirm Password"
        name="confirmPassword"
        errors={errors}
        placeholder="Enter your confirm password..."
        type="password"
        register={register}
      />
      <p className="mb-5 md:mb-0">
        Already have an account?{" "}
        <Link href="/sign-in" className="underline hover:text-blue-900">
          Login
        </Link>{" "}
      </p>
      <Button
        className="w-fit ml-auto tracking-widest rounded-full py-7 px-10 min-w-40 text-lg"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="w-5 h-5 animate-spin"/>
        ):(
          "Register"
        )}
      </Button>
    </form>
  ) : (
    <div className="text-center">
      <p>We&apos;ve sent a verification to your email at</p>
      <p className="font-bold">{email}</p>
      <p className="mt-5">Please verify your email and continue to login page</p>
      <Button asChild className="mt-3">
        <Link href='/sign-in' className="uppercase tracking-widest rounded-full text-sm">Back to login page</Link>
      </Button>
    </div>
  );
};

export default SignUpForm;
