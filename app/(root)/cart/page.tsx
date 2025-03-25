import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMyCart } from "@/lib/actions/cart.action";
import { Minus, Plus } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: 'Cart',

}

const CartPage = async () => {
  const cart = await getMyCart()

  if(!cart){
    return (
      <div>There is no cart</div>
    )
  } 
  return (
    <div className="w-full max-w-screen px-5">

      <h1 className="text-3xl md:text-5xl my-5 lg:my-10 w-full text-center">My Cart</h1>
      <div className="flex flex-col lg:flex-row justify-center gap-10">

        <div className="flex flex-col">
          <Table>
            <TableCaption>A list of your added product.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-60 lg:w-80 uppercase text-xs">Product</TableHead>
                <TableHead className="w-32 uppercase text-xs">Price</TableHead>
                <TableHead className="uppercase text-xs">Quantity</TableHead>
                <TableHead className="uppercase text-xs text-right">Total Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart?.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="flex gap-2 mr-5 items-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      height={200}
                      width={100}
                      className="object-cover"
                    />
                    <h2 className="break-words whitespace-normal">{item.name}</h2>
                  </TableCell>
                  <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-between items-center w-28 h-10 rounded-md border px-1">
                      <Minus size={15}/>
                      {item.qty}
                      <Plus size={15}/>
                    </div>
                  </TableCell>
                  <TableCell className="text-lg">Rp {(item.price*item.qty).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
          

        <div className="flex flex-col min-w-72">
          <h4 className="text-xl mb-5">Summary</h4>
          <div className="flex flex-col gap-2">

            <div className="flex w-full justify-between">
              <p>Subtotal</p>
              <p>Rp {parseInt(cart?.itemsPrice||"").toLocaleString()}</p>
            </div>

            <div className="flex w-full justify-between">
              <p>Tax Price</p>
              <p>Rp {parseInt(cart?.taxPrice||"").toLocaleString()}</p>
            </div>

            <hr className="mt-3" />
            <div className="flex w-full justify-between">
              <p className="font-bold">Total</p>
              <p className="font-semibold">Rp {parseInt(cart?.totalPrice||"").toLocaleString()}</p>
            </div>
            <hr />

          </div>

          <Button className="rounded-full py-8 uppercase tracking-widest mt-10">Checkout</Button>
        </div>
      </div>

    </div>
  );
}
 
export default CartPage;