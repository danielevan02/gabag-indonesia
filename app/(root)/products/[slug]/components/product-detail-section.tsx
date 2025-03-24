'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { FullProductType } from "@/types"
import { Variant } from "@prisma/client"
import Image from "next/image"
import { Suspense, useState } from "react"

const ProductDetailSection = ({product}: {product: FullProductType}) => {
  const [variant, setVariant] = useState<Variant>()
  const lowestPrice = Math.min(...product.variant.map((v) => Number(v.price)))
  const [price, setPrice] = useState(lowestPrice||product.price)
  const imagesList = [...product?.images || [], ...product?.variant.map(v => v.image) || []]
  const [mainImage, setMainImage] = useState(imagesList[0])
  const categoryDiscount = product?.categories.reduce((prev, curr) => prev + (curr.discount??0), 0)
  return (
    <div className="relative flex flex-col md:flex-row md:gap-5 justify-center items-start w-full">
      {/* IMAGE SECTION */}
      <div
        className={`
        relative 
        md:sticky 
        flex 
        flex-col-reverse 
        md:flex-row 
        w-full 
        h-full
        lg:max-w-md
        xl:max-w-xl
        md:max-h-[500px]
        lg:max-h-[440px]
        xl:max-h-[600px]
        gap-2 
        md:left-0 
        md:top-56 
        lg:top-36
        xl:top-48
        overflow-hidden
        `}
      >
        {/* IMAGE LIST CONTAINER */}
        <div
          className={`
          flex 
          flex-row 
          md:flex-col 
          md:min-w-fit
          gap-3 
          max-h-full
          overflow-scroll 
          snap-x 
          md:snap-y 
          snap-mandatory
          `}
        >
          {imagesList.map((item) => (
            <Suspense key={item} fallback={<Skeleton className="w-20 h-20 rounded-md" />}>
              <div className="relative snap-start min-h-20 max-h-20 min-w-20 max-w-20 rounded-md overflow-hidden" onMouseEnter={()=>setMainImage(item)}>
                <Image
                  src={item}
                  alt="Product Images"
                  height={100}
                  width={100}
                  className={`
                    h-full 
                    w-full
                    object-cover 
                  `}
                />
                <div className={cn("absolute inset-0 rounded-md", item === mainImage && 'bg-black/30 ')}/>
              </div>
            </Suspense>
          ))}
        </div>

        {/* MAIN IMAGE */}
        <div className="flex-1 min-h-full w-full">
          <Suspense fallback={<Skeleton className="w-full h-full rounded-md" />}>
            <Image
              src={mainImage}
              alt={product?.name || "Product Images"}
              height={1000}
              width={1000}
              className={`
              w-full
              h-full
              object-cover 
              rounded-md
            `}
            />
          </Suspense>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mt-5 max-w-80 xl:max-w-96">
        <h2 className="uppercase tracking-wider text-foreground/60 text-sm md:text-base">
          {product?.categories[0].name}
        </h2>
        <h1 className="md:text-xl font-medium tracking-wider mb-5">{product?.name}</h1>
        <PriceTag price={Number(price)} discount={ variant?.discount || product?.discount || categoryDiscount} variant={variant} />

        {product?.hasVariant && (
          <>
            <span className="uppercase tracking-widest text-sm">Variants:</span>
            <div className="flex gap-3 mt-3">
              {product?.variant.map((item) => (
                <div 
                  key={item.id} 
                  onClick={()=> {
                    setVariant(item)
                    setMainImage(item.image)
                    setPrice(item.price)
                  }} 
                  className="flex flex-col items-center gap-1 rounded-lg" 
                >
                  <Suspense fallback={<Skeleton className="w-20 h-20 rounded-md" />}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={200}
                      height={200}
                      className={cn("w-20 h-20 object-cover rounded-md hover:border-2 hover:border-black", variant === item && "border-2 border-black")}
                    />
                  </Suspense>
                  <h3 className="text-xs text-neutral-500 dark:text-neutral-300">{item.name}</h3>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 mt-5 mb-10">
          <p className="">
            Stock: <span className="font-medium">{product?.stock}</span>
          </p>
          <div className="flex items-center gap-2">
            <p>Quantity:</p>
            {product?.stock ? (
              <Input type="number" className="w-20" min={1} max={product?.stock} />
            ) : (
              <span className="text-red-600 tracking-wider">Out of stock!</span>
            )}
          </div>
          <Button className="uppercase tracking-widest rounded-full py-7 w-full mt-5">
            add to cart
          </Button>
          <Button className="uppercase tracking-widest rounded-full py-7 w-full" variant="outline">
            favourite
          </Button>
        </div>

        <pre className="whitespace-pre-wrap text-neutral-700" style={{ fontFamily: "inherit" }}>
          {product?.description}
        </pre>
      </div>
    </div>
  );
};

export default ProductDetailSection;

const PriceTag = ({price, discount, variant}:{price: number; discount?: number; variant?: Variant;}) => {
  let lastPrice = price;
  if(discount){
    lastPrice = Number(price) - Number(price)*(discount/100)
  }
  return(
    <>
      {discount ? (
        <div className="flex flex-row gap-3 mb-5 items-center">
          <h3 className="font-semibold text-lg tracking-wider"> {!variant && <span className="font-normal">From</span>} Rp {lastPrice.toLocaleString()}</h3>
          <h3 className="line-through text-neutral-400 text-base">Rp {price.toLocaleString()}</h3>
          <p className="text-green-700 font-medium">{discount}% off</p>
        </div>
      ):(
        <h4 className="font-semibold text-lg tracking-wider">Rp {lastPrice.toLocaleString()}</h4>
      )}
    </>
  )
}