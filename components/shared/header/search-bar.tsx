'use client';

import { Input } from '@/components/ui/input';
import { searchProduct } from '@/lib/actions/product.action';
import { Product } from '@prisma/client';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useTransition, ChangeEvent } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, startTransition] = useTransition()
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk mencari produk berdasarkan keyword
  const searchProducts = async (keyword: string) => {
    startTransition(async () => {
      if (!keyword.trim()) {
        setProducts([]);
        return;
      }
  
      try {
        const response = await searchProduct(keyword);
        setProducts(response);
      } catch (error) {
        console.error('Error searching products:', error);
      }
    })
  };

  // Debounce function untuk mengurangi permintaan API
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) { 
        setProducts([]);
        setShowDropdown(false)
        return;
      }
  
      searchProducts(query);
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

  return (
    <div className="relative" ref={searchContainerRef}>
      <div className="relative flex items-center">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(query.length > 0)}
          placeholder="Search product..."
          className="py-2 w-40 focus:w-72 transition-all px-4 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className='absolute right-2 top0 text-neutral-300'/>
      </div>

      {showDropdown && (
        <div className="absolute mt-1 w-full bg-background border border-accent rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
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
                      src={product.images[0]}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="min-w-12 max-w-12 h-12 object-cover rounded mr-3"
                    />
                  )}
                  <div>
                    <div className="font-bold text-sm line-clamp-1">{product.name}</div>
                    <div className="text-sm text-gray-600">Rp{product.price.toLocaleString()}</div>
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