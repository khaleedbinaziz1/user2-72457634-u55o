import { notFound } from 'next/navigation';
import axios from 'axios';
import ProductDetail1 from '@/components/ProductDetail/ProductDetail1';
import { CartProvider } from '@/components/Cart/CartProvider';

// This function is required for static export
export async function generateStaticParams() {
  try {
    // Try to fetch data from API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:500';
    const response = await axios.get(`${apiUrl}/public/s/68985dc8b866be5ac50c15f9/products`);
    const products = response.data || [];
    
    return products.map((product: any) => ({
      id: product._id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return a fallback array with common product IDs to ensure build succeeds
    // This allows the build to complete even if API is not available
    return [
      { id: 'fallback-product-1' },
      { id: 'fallback-product-2' },
      { id: 'fallback-product-3' }
    ];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  
  try {
    // Use environment variable for API URL, fallback to localhost for development
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:500';
    const response = await axios.get(`${apiUrl}/public/s/68985dc8b866be5ac50c15f9/products`);
    const products = response.data || [];
    
    // Find the product with the matching ID
    const product = products.find((p: any) => p._id === id);
    
    if (!product) {
      notFound();
    }
    
    return (
      <CartProvider>
        <ProductDetail1 product={product} />
      </CartProvider>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}