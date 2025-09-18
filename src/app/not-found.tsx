'use client'

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className='relative border border-transparent lg:border-neutral-200 flex flex-col lg:flex-row items-center rounded-xl shadow-none lg:shadow-xl px-10 pt-10 lg:pt-24 pb-10 lg:pb-0 '>
        <Image
          src="/images/404.webp"
          alt='notFoundLogo'
          width={500}
          height={500}
          className='absolute -top-16 lg:-top-20 left-1/2 -translate-x-1/2 w-44 h-32 lg:w-72 lg:h-52 object-cover'
        />
        <Image
          src="/images/not-found-picture.webp"
          alt='notFoundPicture'
          width={500}
          height={500}
          className='w-60 h-52 lg:w-96 lg:h-72 object-cover'
        />
        <div className='flex flex-col max-w-md text-wrap gap-5'>
          <h1 className='text-4xl text-center lg:text-7xl lg:text-start font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-green-600 via-blue-300 to-red-400'>
            <span>Oops! Page Not Found.</span>
          </h1>
          <p className='text-center'>The page you are looking for might have been removed, had it&apos;s name changed, or is temporarily unavailable.</p>
          <Button className='rounded-lg' asChild>
            <Link href='/' className='text-white'>Back to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
 
export default NotFoundPage;