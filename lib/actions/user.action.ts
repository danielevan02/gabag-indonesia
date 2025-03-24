'use server'

import { signIn, signOut } from "@/auth"
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signInWithCredetials(data: {email: string; password: string;}){
  try {
    await signIn('credentials', data)
    return {success: true, message: "Login success" }
  } catch (error) {
    if(isRedirectError(error)){
      throw error
    }
    return { success: false, message: 'Invalid email or password'}
  }
}

export async function signOutUser(){
  await signOut()
}