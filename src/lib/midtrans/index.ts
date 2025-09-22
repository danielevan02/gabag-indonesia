import { Snap } from 'midtrans-client'
import { MidtransClient } from "midtrans-node-client"

const snap  = new Snap({
  isProduction: false,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  serverKey: process.env.MIDTRANS_SERVER_KEY!
})

export const tempSnap = new MidtransClient.Snap({
  isProduction: false,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  serverKey: process.env.MIDTRANS_SERVER_KEY!
})

export default snap