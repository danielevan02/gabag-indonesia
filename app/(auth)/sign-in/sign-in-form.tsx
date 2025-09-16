'use client'

import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from "@/lib/schema";
import { defaultLogin } from "@/lib/defaultValues";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import Link from "next/link";
import { signInWithCredetials } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormField } from "@/components/shared/input/form-field";
import { Loader } from 'lucide-react';

type LoginType = z.infer<typeof loginSchema>

const SignInForm = () => {
  const router = useRouter()
  const [isLoading, startTransition] = useTransition()
  const {
    handleSubmit,

    formState: { errors },
    register
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLogin
  })

  const onSubmit: SubmitHandler<LoginType> = async (data) => {
    startTransition(async () => {
      const res = await signInWithCredetials(data)
      
      if(res.success){
        toast.success(res.message)
        router.push('/')
      } else {
        toast.error(res.message)
      }
    })
  }
  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Email"
        name="email"
        placeholder="enter your email..."
        errors={errors}
        type="email"
        register={register}
      />

      <FormField
        label="Password"
        name="password"
        type='password'
        placeholder="enter your password..."
        errors={errors}
        register={register}
      />
      <p className="mb-5 md:mb-0">Don&apos;t have an account? <Link href='/sign-up' className="underline hover:text-blue-900">Create Account</Link> </p>
      <Button className="w-fit ml-auto tracking-widest rounded-full py-7 px-10 min-w-40 text-lg" type="submit">
        {isLoading ? (
          <Loader className="animate-spin"/>
        ):("Login")}
      </Button>
    </form>
  );
}

export default SignInForm;