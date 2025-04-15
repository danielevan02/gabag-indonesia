'use server'

import { revalidatePath } from "next/cache"

export function revalidateData(path: string){
  revalidatePath(path)
}