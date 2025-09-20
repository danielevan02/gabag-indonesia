import Image from "next/image";
import { getPlaiceholder } from "plaiceholder";

type BlurImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  dynamic?: boolean;
};

export default async function BlurImage({
  src,
  alt,
  width,
  height,
  className,
  dynamic = false,
}: BlurImageProps) {
  
  if(dynamic){
    const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()));
  
    const { base64 } = await getPlaiceholder(buffer);
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        width={100}
        height={100}
        placeholder="blur"
        {...(dynamic && { blurDataURL: base64 })}
      />
    );
  } else {
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        quality={60}
        placeholder="blur"
      />
    );
    
  }

}
