'use server'

import { auth, signIn, signOut } from "../../auth"
import { redirect } from "next/navigation";
import prisma from "../prisma";
import { Address } from "@/types";
import { serializeType } from "../utils";
import { SignUpType } from "@/app/(auth)/sign-up/sign-up-form";
import {hash} from 'bcrypt-ts-edge'
import {v4 as uuidv4} from 'uuid'
import { sendVerificationEmail } from "@/email/send-verification";
import { revalidatePath, revalidateTag } from "next/cache";

 
export async function signInWithCredetials(data: {email: string; password: string;}) {
  try {
    await signIn('credentials', {...data, redirect: false})
    
    return {
      success: true,
      message: 'Login Success'
    }
  } catch (err: any) {
    console.log(err)
    return {
      success: false,
      message: err.code
    }
  }
}


async function getVerificationToken(email: string){
  const token = uuidv4()
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 1); // 1 hour

  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email
    }
  })

  if(existingToken){
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token
        }
      }
    })
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  return verificationToken
}

export async function registerUser(data: SignUpType) {
  try {

    const existUser = await prisma.user.findFirst({
      where: {
        email: data.email
      }
    })

    if(existUser&&existUser.emailVerified) throw 'This email is already in used, please use another email'
    
    const existPhone = await prisma.user.findFirst({
      where: {
        phone: data.phone
      }
    })

    if(existPhone&&existPhone.emailVerified) throw "This phone number is already used, please use another number"
    
    const email = data.email.toLowerCase()

    const hashedPassword = await hash(data.password, 10)

    if(!existUser){
      await prisma.user.create({
        data: {
          email,
          name: data.fullName,
          phone: data.phone,
          password: hashedPassword
        }
      })
    } else {
      await prisma.user.update({
        where: {id: existUser.id},
        data: {
          email: email,
          password: hashedPassword,
          phone: data.phone,
          name: data.fullName
        }
      })
    }

    const verificationToken = await getVerificationToken(email)

    await sendVerificationEmail(email, verificationToken.token)
    
    return{
      success: true,
      message: 'Email verification is sent'
    }
  } catch (error) {
    return {
      success: false,
      message: error
    }
  }
}

export async function verifyEmail(token: string) {
  try {
    if(!token) throw "There is no token provided"
    
    const existToken = await prisma.verificationToken.findFirst({
      where: {
        token
      }
    })
    
    if(!existToken) throw "Invalid token"
    
    const isExpired = new Date(existToken.expires) < new Date()

    if(isExpired) throw "Token is expired"

    const existUser = await prisma.user.findFirst({
      where: {
        email: existToken.identifier
      }
    })

    if(!existUser) throw "User not found"

    await prisma.user.update({
      where: {
        id: existUser.id
      },
      data:{
        emailVerified: new Date()
      }
    })

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existToken.identifier,
          token: existToken.token
        }
      }
    })

    return {
      success: true,
      message: 'Email verified'
    }
    
  } catch (error) {
    return{
      success: false,
      message: error
    }
  }
}

export async function signOutUser(){
  await signOut()
  redirect('/')
}

export async function getUserById(id?: string){
  const user = await prisma.user.findFirst({
    where: {
      id
    }
  })

  if(user){
    return serializeType({
      ...user,
      address: user?.address as Address
    })
  } else {
    return user
  }
}

export async function getCurrentUser(){
  const session = await auth()
  if(!session) throw new Error("User is not authenticated!")
  const user = await prisma.user.findFirst({
    where: {id: session?.user?.id}
  })

  if(user){
    return serializeType({
      ...user,
      address: user.address as Address
    })
  }
}

export async function updateProfile({name, phone, image, userId}: {name?: string; phone?: string; image?: string; userId: string}) {
  const dataToUpdate: Partial<{ name: string; phone: string; image: string }> = {};

  if (name !== undefined) dataToUpdate.name = name;
  if (phone !== undefined) dataToUpdate.phone = phone;
  if (image !== undefined) dataToUpdate.image = image;

  // Jika tidak ada data yang diberikan, kembalikan error
  if (Object.keys(dataToUpdate).length === 0) {
    return {
      success: false,
      message: "Tidak ada data yang ingin diperbarui.",
    };
  }

  try {
    await prisma.user.update({
      where: {id: userId},
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(image !== undefined && { image }),
      },
    })

    revalidateTag('productBySlug')

    revalidatePath('/profile')

    return {
      success: true,
      message: 'Update success!'
    }
  } catch (error) {
    return {
      success: false,
      message: error
    }
  }
}

export async function updateAddress({address, id}:{ id: string; address: Address}) {
  
  try {
    await prisma.user.update({
      where: {id},
      data: {
        address
      }
    })

    return {
      success: true,
      message: 'Address successfully updated'
    }
  } catch (error) {
    return{
      success: false,
      message: error
    }
  }
}