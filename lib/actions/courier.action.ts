'use server'

import { Courier } from "@/types"

export async function getAllCouriers(){
  try {
    const res = await fetch("https://api.biteship.com/v1/couriers", {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`
      }
    })
  
    if(!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    
    const data = await res.json()
    
    return data.couriers as Courier[]
  } catch (error) {
    console.log(error)
  }
}