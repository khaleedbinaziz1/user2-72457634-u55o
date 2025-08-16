'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';

const ProductSection = dynamic(() => import('@/components/ProductSection/ProductSection2'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

const Products = () => {
  const allProductsRef = useRef<HTMLDivElement | null>(null);
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">All Products</h1>
        <ProductSection allProductsRef={allProductsRef} />
      </div>
    </div>
  );
};

export default Products;