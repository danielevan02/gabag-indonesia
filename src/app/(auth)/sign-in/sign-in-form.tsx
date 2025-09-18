'use client'

import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormField } from "@/components/shared/input/form-field";
import { Loader } from 'lucide-react';
import { trpc } from '@/trpc/client';

type LoginType = z.infer<typeof signInSchema>

const SignInForm = () => {
  const router = useRouter()
  const {
    handleSubmit,
    formState: { errors },
    register
  } = useForm({
    resolver: zodResolver(signInSchema),
  })

  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess: (res) => {
      if(res.success){
        toast.success(res.message)
        router.push('/')
      } else {
        toast.error(res.message)
      }
    },
    onError: (error) => {
      toast.error('Login failed')
    }
  })

  const onSubmit: SubmitHandler<LoginType> = (data) => {
    signInMutation.mutate(data)
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
      <Button className="w-fit ml-auto tracking-widest rounded-full py-7 px-10 min-w-40 text-lg" type="submit" disabled={signInMutation.isPending}>
        {signInMutation.isPending ? (
          <Loader className="animate-spin"/>
        ):("Login")}
      </Button>
    </form>
  );
}

export default SignInForm;