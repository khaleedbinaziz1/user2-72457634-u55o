"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '../Cart/CartProvider';
import { useRouter } from 'next/navigation';
import { FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import { FaFacebookMessenger, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { useApiConfig } from '@/context/ApiConfigContext';

interface Variation {
  size?: string;
  color?: string;
  price?: number;
  stock?: number;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  costPrice: string;
  regularPrice: string;
  salePrice: string;
  stockStatus: "STOCK IN" | "STOCK OUT" | "LOW STOCK";
  stockNumber: string;
  showProduct: boolean;
  hasExpirationDate: boolean;
  expirationDate: string | null;
  hasVariations: boolean;
  variations: Variation[];
  description: string;
  images: string[];
  createdAt: string;
}

interface ProductDetailProps {
  product: Product;
}

export type { ProductDetailProps };

// Cache for related products
const relatedProductsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const ProductDetail1: React.FC<ProductDetailProps> = ({ product }) => {
  const [actualProduct, setActualProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, buyNow } = useCart();
  const router = useRouter();
  const { apiBaseUrl, publicBaseUrl } = useApiConfig();

  useEffect(() => {
    let cancelled = false;
    const isPlaceholder =
      !product ||
      product.name === 'Sample Product' ||
      isNaN(parseFloat(product.salePrice)) ||
      !product._id;
    if (isPlaceholder) {
      setLoading(true);
      const url = publicBaseUrl
        ? `${publicBaseUrl}products`
        : `${apiBaseUrl}products`;
      axios.get(url).then(res => {
        if (cancelled) return;
        const all = res.data as Product[];
        const first = all.find(p => p.showProduct && p.name && p._id);
        setActualProduct(first || null);
        setLoading(false);
      });
    } else {
      setActualProduct(product);
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [product, apiBaseUrl, publicBaseUrl]);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (actualProduct && actualProduct.hasVariations && actualProduct.variations.length > 0) {
      setSelectedVariation(actualProduct.variations[0]);
    } else {
      setSelectedVariation(null);
    }
  }, [actualProduct]);

  const priceInfo = useMemo(() => {
    if (!actualProduct) return { currentPrice: 0, originalPrice: 0, isOnSale: false, discountPercentage: 0 };
    const currentPrice = parseFloat(actualProduct.salePrice);
    const originalPrice = parseFloat(actualProduct.regularPrice);
    const isOnSale = currentPrice < originalPrice;
    const discountPercentage = isOnSale
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;
    return { currentPrice, originalPrice, isOnSale, discountPercentage };
  }, [actualProduct]);

  const stockInfo = useMemo(() => {
    if (!actualProduct) return { isInStock: false, stockNumber: 0 };
    const isInStock =
      actualProduct.stockStatus === "STOCK IN" && parseInt(actualProduct.stockNumber) > 0;
    const stockNumber = Math.max(0, parseInt(actualProduct.stockNumber) || 0);
    return { isInStock, stockNumber };
  }, [actualProduct]);

  const formattedDescription = useMemo(() => {
    if (!actualProduct) return '';
    return actualProduct.description.replace(/\n/g, "<br />");
  }, [actualProduct]);

  const cartProduct = useMemo(
    () => actualProduct ? ({
      ...actualProduct,
      salePrice: parseFloat(actualProduct.salePrice),
      regularPrice: parseFloat(actualProduct.regularPrice),
    }) : null,
    [actualProduct]
  );

  const fetchRelatedProducts = useCallback(
    async (category: string, productId: string, signal: AbortSignal) => {
      const cacheKey = `related_${category}_${productId}`;
      const cached = relatedProductsCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setRelatedProducts(cached.data);
        return;
      }

      try {
        setLoadingRelated(true);
        const url = publicBaseUrl
        ? `${publicBaseUrl}products`
        : `${apiBaseUrl}products`;
      const response = await axios.get(url, {
            signal,
            timeout: 8000, // 8 second timeout
          }
        );

        const allProducts: Product[] = response.data;
        const related = allProducts
          .filter(
            (p) =>
              p.category === category && p._id !== productId && p.showProduct
          )
          .slice(0, 8);

        relatedProductsCache.set(cacheKey, {
          data: related,
          timestamp: Date.now(),
        });

        setRelatedProducts(related);
      } catch (error) {
        if (!signal.aborted) {
          console.error("Error fetching related products:", error);
          setRelatedProducts([]);
        }
      } finally {
        if (!signal.aborted) {
          setLoadingRelated(false);
        }
      }
    },
    [apiBaseUrl]
  );

  useEffect(() => {
    if (!actualProduct || !actualProduct.category) return;

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      fetchRelatedProducts(actualProduct.category, actualProduct._id, controller.signal);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [actualProduct, fetchRelatedProducts]);

  const handleBuyNow = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (cartProduct) buyNow(cartProduct, 1);
    },
    [buyNow, cartProduct]
  );

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setQuantity(parseInt(e.target.value));
    },
    []
  );

  const handleVariationSelect = useCallback((variation: Variation) => {
    setSelectedVariation(variation);
  }, []);

  const handleRelatedProductClick = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}`);
    },
    [router]
  );

  if (loading || !actualProduct) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading product...</div>;
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Images */}
          <div className="lg:max-w-lg lg:self-start">
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
              <Image
                src={actualProduct.images[selectedImageIndex] || "/placeholder.png"}
                alt={actualProduct.name}
                width={500}
                height={500}
                className="object-center object-cover w-full h-full"
                priority
              />
            </div>
            {actualProduct.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-4">
                {actualProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleImageSelect(idx)}
                    className={`border rounded-md overflow-hidden ${
                      selectedImageIndex === idx
                        ? "ring-2 ring-indigo-500"
                        : "border-gray-200"
                    }`}
                    aria-label={`Select image ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${actualProduct.name} ${idx + 1}`}
                      width={80}
                      height={80}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {actualProduct.name}
            </h1>

            <div className="mt-4 flex items-center gap-6">
              <p className="text-3xl font-bold text-gray-900">
                ৳{priceInfo.currentPrice.toFixed(0)}
              </p>
              {priceInfo.isOnSale && (
                <>
                  <p className="text-xl line-through text-gray-500">
                    ৳{priceInfo.originalPrice.toFixed(0)}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {priceInfo.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <p>
                <strong>Brand:</strong> {actualProduct.brand}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    stockInfo.isInStock ? "text-green-600" : "text-red-600"
                  }
                >
                  {stockInfo.isInStock
                    ? `In Stock (${actualProduct.stockNumber})`
                    : actualProduct.stockStatus === "LOW STOCK"
                    ? `Low Stock (${actualProduct.stockNumber})`
                    : "Out of Stock"}
                </span>
              </p>
              <p>
                <strong>SKU:</strong> {actualProduct.sku}
              </p>
            </div>

            {/* Variations selection */}
            {actualProduct.hasVariations && actualProduct.variations.length > 0 && (
              <div className="mt-8">
                <p className="font-semibold text-gray-900 mb-2">
                  Select Variation:
                </p>
                <div className="flex flex-wrap gap-3">
                  {actualProduct.variations.map((variation, index) => (
                    <button
                      key={index}
                      onClick={() => handleVariationSelect(variation)}
                      className={`px-4 py-2 border rounded-md cursor-pointer text-sm ${
                        selectedVariation === variation
                          ? "border-indigo-700 bg-indigo-100 font-semibold"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {variation.size && `Size: ${variation.size}`}
                      {variation.color && `Color: ${variation.color}`}
                      {variation.price && ` - ৳${variation.price}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div className="mt-6">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-900"
              >
                Quantity
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                className="mt-2 block w-24 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                disabled={!stockInfo.isInStock}
              >
                {[...Array(Math.min(stockInfo.stockNumber, 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiration Date */}
            {actualProduct.hasExpirationDate && actualProduct.expirationDate && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Expiration Date:</strong>{" "}
                  {new Date(actualProduct.expirationDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (cartProduct) addToCart(cartProduct, quantity); // Use the selected quantity from state
                }}
                disabled={!stockInfo.isInStock}
                className={`flex-1 inline-flex items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white hover:bg-accent transition-colors ${
                  stockInfo.isInStock
                    ? "bg-primary"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <FiShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!stockInfo.isInStock}
                className={`flex-1 inline-flex items-center justify-center rounded-md border px-8 py-3 text-base font-medium transition-colors ${
                  stockInfo.isInStock
                    ? "border-primary bg-white text-primary hover:bg-accent"
                    : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Buy Now
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-4 w-full">
              <a
                href="tel:017XXXXXXXX"
                className="btn bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-3 w-full sm:w-auto py-4 px-6 text-lg rounded-full"
              >
                <FaPhone className="w-5 h-5" />
                Call Now
              </a>

              <a
                href="https://m.me/yourpageusername"
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-blue-600 text-white hover:bg-secondary/90 flex items-center justify-center gap-3 w-full sm:w-auto py-4 px-6 text-lg rounded-full"
              >
                <FaFacebookMessenger className="w-5 h-5" />
              </a>

              <a
                href="https://wa.me/8801XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-green-500 text-white hover:bg-accent/90 flex items-center justify-center gap-3 w-full sm:w-auto py-4 px-6 text-lg rounded-full"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        {actualProduct.description && (
          <section className="mt-12">
            <div className="bg-base-100 border border-primary rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Product Description
              </h2>
              <div
                className="text-base text-base-content leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{ __html: formattedDescription }}
              />
            </div>
          </section>
        )}

        {/* Related Products */}
        <section className="mt-16">
          <h3 className="text-2xl font-semibold text-gray-900">
            Related Products
          </h3>
          {loadingRelated ? (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => {
                const relatedCurrentPrice = parseFloat(related.salePrice);
                const relatedOriginalPrice = parseFloat(related.regularPrice);
                const relatedIsOnSale =
                  relatedCurrentPrice < relatedOriginalPrice;

                return (
                  <div
                    key={related._id}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-indigo-600 hover:shadow-lg transition-all duration-300"
                    onClick={() => handleRelatedProductClick(related._id)}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                      <Image
                        src={related.images?.[0] || "/placeholder.png"}
                        alt={related.name}
                        width={300}
                        height={300}
                        className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {relatedIsOnSale && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {Math.round(
                            ((relatedOriginalPrice - relatedCurrentPrice) /
                              relatedOriginalPrice) *
                              100
                          )}
                          % OFF
                        </div>
                      )}
                      {related.stockStatus !== "STOCK IN" && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2">
                        {related.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          ৳{relatedCurrentPrice.toFixed(2)}
                        </p>
                        {relatedIsOnSale && (
                          <p className="text-xs line-through text-gray-500">
                            ৳{relatedOriginalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {related.brand}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">No related products found.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDetail1;
