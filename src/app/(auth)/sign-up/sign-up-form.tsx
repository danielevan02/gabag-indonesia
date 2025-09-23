"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/schema";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import Link from "next/link";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";

export type SignUpType = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const [email, setEmail] = useState('') 
  const [isLoading, startTransition] = useTransition()
  const signUpMutation = trpc.auth.register.useMutation()
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      confirmPassword: '',
      email: '',
      fullName: '',
      password: '',
      phone: ''
    }
  });

  const onSubmit: SubmitHandler<SignUpType> = async (data) => {
    startTransition(async()=>{
      const res = await signUpMutation.mutateAsync(data)
      
      if(!res?.success){
        toast.error(res?.message as string)
      } else {
        setEmail(data.email)
      }
    })
  };

  return !email ? (
    <Form {...form}>
      <form className="flex flex-col px-1" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-y-4">
          <FormInput
            form={form}
            label="Full Name"
            fieldType="text"
            name="fullName"
            placeholder="e.g: John Doe"
          />

          <FormInput
            form={form}
            label="Email"
            fieldType="text"
            name="email"
            placeholder="e.g: johndoe@email.com"
          />

          <FormInput
            form={form}
            label="Phone"
            fieldType="phone"
            name="phone"
            placeholder="e.g: 0812 3456 7890"
          />

          <FormInput
            form={form}
            label="Password"
            fieldType="password"
            name="password"
            placeholder="e.g: johndoe123"
            showPass
          />

          <FormInput
            form={form}
            label="Confirm Password"
            fieldType="password"
            name="confirmPassword"
            placeholder="Re-type your password"
          />
        </div>
        
        <p className="mb-5 md:mb-0 mt-5">
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
    </Form>
  ) : (
    <div className="text-center">
      <p>We&apos;ve sent a verification to your email at</p>
      <p className="font-bold">{email}</p>
      <p className="mt-5">Please verify your email and continue to login page</p>
      <Button asChild className="rounded-full mt-3">
        <Link href='/sign-in' className="uppercase tracking-widest rounded-full text-sm">Back to login page</Link>
      </Button>
    </div>
  );
};

export default SignUpForm;
