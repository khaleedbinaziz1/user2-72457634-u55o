'use client';
import React, { Suspense, useRef, useState } from 'react';
import Hero1 from '@/components/Hero/Hero1';
import TopCategories5 from '@/components/TopCategories/TopCategories5';
import ProductSection2 from '@/components/ProductSection/ProductSection2';

export default function Home() {
  const allProductsRef = useRef<HTMLDivElement | null>(null);
  const [globalCategoryFilter, setGlobalCategoryFilter] = useState<string | null>(null);

  const handleCategoryBannerClick = (categoryName: string) => {
    setGlobalCategoryFilter(categoryName);
    setTimeout(() => {
      allProductsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen">
      <main>
        <Hero1 />
        
        <TopCategories5 onCategoryClick={handleCategoryBannerClick} />
        
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductSection2
            allProductsRef={allProductsRef}
          />
        </Suspense>
      </main>
    </div>
  );
}