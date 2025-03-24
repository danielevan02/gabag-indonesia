'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from "@/lib/schema";
import { defaultLogin } from "@/lib/defaultValues";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import Link from "next/link";
import { signInWithCredetials } from "@/lib/actions/user.action";
import toast from "react-hot-toast";

type LoginType = z.infer<typeof loginSchema>

const SignInForm = () => {
  const [passShown, setPassShown] = useState(false)
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
      const response = await signInWithCredetials(data)
      if(response.success){
        toast.success(response.message)
      } else {
        toast.error(response.message)
      }
    })
  }
  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2 mb-5">
        <Label htmlFor="email-input" className="text-lg">Email</Label>
        <Input id="email-input" placeholder="enter your email.." className="border-black peer py-6" {...register('email')} />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <Label htmlFor="password-input" className="text-lg">Password</Label>
        <div className="relative flex items-center">
          <Input id="password-input" placeholder="enter your password.." className="border-black peer py-6" type={passShown ? 'text' : 'password'} {...register('password')} />
          {passShown ? 
            <EyeOff className="w-5 h-5 absolute right-3" onClick={()=>setPassShown(false)}/> 
            : <Eye className="w-5 h-5 absolute right-3" onClick={()=>setPassShown(true)}/>}
        </div>
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>
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