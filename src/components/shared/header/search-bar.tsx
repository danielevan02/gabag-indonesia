'use client';

import { Input } from '@/components/ui/input';
import { updateQueryParams } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter()
  const searchParams = useSearchParams()

  // TRPC query untuk search products
  const { data: products = [], isLoading } = trpc.product.search.useQuery(
    { keyword: debouncedQuery },
    {
      enabled: debouncedQuery.trim().length > 0,
      refetchOnWindowFocus: false,
    }
  );

  // Debounce function untuk mengurangi permintaan API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim().length > 0) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Tutup dropdown ketika user klik di luar search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && event.target instanceof Node && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key === "Enter"){
      updateQueryParams({search: query}, searchParams, router)
    }
  }

  return (
    <div className='relative' ref={searchContainerRef}>
      <div className="flex relative items-center w-fit">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(query.length > 0)}
          onKeyDown={(e) => handleEnter(e)}
          placeholder="Search product..."
          className="py-2 relative text-sm md:text-base w-60 lg:w-52 lg:focus:w-72 transition-all px-4 border rounded-none border-black dark:border-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className='absolute right-2 text-neutral-500 z-10'/>
      </div>

      {showDropdown && (
        <div className="absolute mt-1 w-full bg-background border border-accent shadow-lg z-10 max-h-96 overflow-y-auto rounded-md">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching product...</div>
          ) : products.length > 0 ? (
            <ul>
              {products.map((product) => (
                <Link
                  href={`/products/${product.slug}`}
                  key={product.id}
                  onClick={() => setShowDropdown(false)}
                  className="px-4 py-2 hover:bg-accent cursor-pointer border-b border-accent last:border-none flex items-center"
                >
                  {product.images && (
                    <Image
                      src={product.images}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="min-w-12 max-w-12 h-12 object-cover rounded-md mr-3"
                    />
                  )}
                  <div>
                    <div className="font-bold text-sm line-clamp-1">{product.name}</div>

                    <div className="text-sm text-gray-600">
                      {product.variants.length !== 0 &&("from ")}
                      Rp{product.price.toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </ul>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-gray-500">There is no product found.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}