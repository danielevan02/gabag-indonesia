'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from "@/lib/schema";
import { defaultLogin } from "@/lib/defaultValues";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

type LoginType = z.infer<typeof loginSchema>

const SignInForm = () => {
  const [passShown, setPassShown] = useState(false)
  const {
    handleSubmit,

    formState: { errors },
    register
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLogin
  })

  const onSubmit: SubmitHandler<LoginType> = (data) => {
    console.log(data)
  }
  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-input" className="text-lg">Email</Label>
        <Input id="email-input" placeholder="enter your email.." className="border-black peer py-6" {...register('email')} />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password-input" className="text-lg">Password</Label>
        <div className="relative flex items-center">
          <Input id="password-input" placeholder="enter your password.." className="border-black peer py-6" type={passShown ? 'text' : 'password'} {...register('password')} />
          {passShown ? 
            <EyeOff className="w-5 h-5 absolute right-3" onClick={()=>setPassShown(false)}/> 
            : <Eye className="w-5 h-5 absolute right-3" onClick={()=>setPassShown(true)}/>}
        </div>
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <Button className="w-fit ml-auto tracking-widest rounded-full py-5 px-7" type="submit">Login</Button>
    </form>
  );
}

export default SignInForm;