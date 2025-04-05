'use server'

import { Areas, Courier, Rates } from "@/types"

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

type CourierRatesReq = {
  destination_postal_code: string
  destination_area_id: string
  items: {
    name: string
    value: number
    quantity: number
    weight: number
  }[]
}

export async function getCourierRates({destination_area_id, destination_postal_code, items}: CourierRatesReq) {
  try {
    const res = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`
      },
      body: JSON.stringify({
        origin_postal_code: process.env.ORIGIN_POSTAL_CODE,
        destination_area_id,
        destination_postal_code,
        origin_area_id: process.env.ORIGIN_AREA_ID,
        couriers: process.env.COURIERS,
        items
      })
    })
    const data = await res.json()
    return data?.pricing as Rates[] 
  } catch (error) {
    console.log(error)
  }
}

export async function getMapsId(inputSearch: string) {
  const url = new URL("https://api.biteship.com/v1/maps/areas");
  const searchParams = new URLSearchParams({
    countries: "ID",
    input: inputSearch,
    type: "single",
  });

  const newUrl = `${url.origin}${url.pathname}?${searchParams.toString()}`;

  const res = await fetch(newUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`,
    },
  });
  const data = await res.json();
  return data?.areas as Areas[];
}