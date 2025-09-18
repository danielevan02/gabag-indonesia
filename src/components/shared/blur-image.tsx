import Image from "next/image";
import { getPlaiceholder } from "plaiceholder";
import fs from "node:fs/promises";

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
  let buffer: Buffer;

  if (dynamic) {
    // Ambil gambar dari URL (misalnya Cloudinary / S3 / API)
    buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    );
  } else {
    // Ambil gambar dari folder public/
    buffer = await fs.readFile(`./public/${src}`);
  }

  const { base64 } = await getPlaiceholder(buffer);

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL={base64}
    />
  );
}
