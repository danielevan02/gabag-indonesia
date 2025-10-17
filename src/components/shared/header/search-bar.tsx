'use client';

import { Input } from '@/components/ui/input';
import { cn, updateQueryParams } from '@/lib/utils';
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
  const { data, isLoading, error } = trpc.product.search.useQuery(
    { keyword: debouncedQuery },
    {
      enabled: debouncedQuery.trim().length > 0,
      refetchOnWindowFocus: false,
      retry: 1, // Only retry once on failure
    }
  );

  const products = data?.products || [];
  const totalCount = data?.totalCount || 0;

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
      // Validate: only proceed if query is not empty or just spaces
      const trimmedQuery = query.trim();
      if (trimmedQuery.length > 0) {
        setShowDropdown(false); // Close dropdown when redirecting
        // Use absolute path and push method to navigate from any page
        updateQueryParams({search: trimmedQuery}, searchParams, router, { absolute: true, method: 'push' });
      }
    }
  }

  const handleSeeAllResults = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 0) {
      setShowDropdown(false);
      // Use absolute path and push method to navigate from any page
      updateQueryParams({search: trimmedQuery}, searchParams, router, { absolute: true, method: 'push' });
    }
  }

  return (
    <div className='relative flex-1' ref={searchContainerRef}>
      <div className="relative flex items-center">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(query.length > 0)}
          onKeyDown={(e) => handleEnter(e)}
          placeholder="Search product..."
          className="h-10 rounded-none border-black"
        />
        <Search className='absolute size-5 right-3 z-10 text-accent-foreground/50'/>
      </div>

      {showDropdown && (
        <div className="absolute w-full mt-1 bg-background border border-accent shadow-lg z-10 max-h-96 overflow-y-auto rounded-md">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching product...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p className="font-semibold">Failed to search products</p>
              <p className="text-xs text-gray-500 mt-1">Please try again</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <ul>
                {products.map((product) => (
                  <Link
                    href={`/products/${product.slug}`}
                    key={product.id}
                    onClick={() => setShowDropdown(false)}
                    className="px-4 py-2 hover:bg-accent cursor-pointer border-b border-accent flex items-center gap-3 relative"
                  >
                    {product.images && (
                      <Image
                        src={product.images}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="min-w-12 max-w-12 h-12 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 font-semibold uppercase">{product.subCategory.name}</div>
                      <div className="font-bold text-sm line-clamp-1">{product.name}</div>

                      {/* Price display with campaign support */}
                      <div className="flex items-center gap-2 mt-1">
                        {/* Show "from" prefix for products with variants */}
                        {product.variants.length !== 0 && (
                          <span className="text-xs text-gray-500">from</span>
                        )}

                        {/* Show strikethrough regular price if there's a discount or campaign */}
                        {(product.price < product.regularPrice || product.campaign) && (
                          <span className="text-xs text-gray-400 line-through">
                            Rp{product.regularPrice.toLocaleString()}
                          </span>
                        )}

                        {/* Campaign or discounted price */}
                        <span className="text-sm font-semibold text-gray-800">
                          Rp{product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Campaign badge */}
                    {product.campaign && (
                      <CampaignBadge campaign={product.campaign} />
                    )}
                  </Link>
                ))}
              </ul>

              {/* See all results link */}
              {totalCount > products.length && (
                <button
                  onClick={handleSeeAllResults}
                  className="w-full px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-accent border-t border-accent transition-colors"
                >
                  See all {totalCount} results
                </button>
              )}
            </>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-gray-500">There is no product found.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Campaign badge component
const CampaignBadge = ({ campaign }: { campaign: { name: string; type: string; discount: number; discountType: "PERCENT" | "FIXED" } }) => {
  const getCampaignColor = (type: string) => {
    switch (type) {
      case "FLASH_SALE":
        return "bg-orange-600";
      case "PAYDAY_SALE":
        return "bg-primary";
      case "SEASONAL":
        return "bg-[#bcb6db]";
      default:
        return "bg-destructive";
    }
  };

  return (
    <div className={cn(
      "px-2 py-0.5 text-white text-[10px] font-bold uppercase rounded text-center",
      getCampaignColor(campaign.type)
    )}>
      {campaign.type.replace(/_/g, ' ')}
    </div>
  );
};