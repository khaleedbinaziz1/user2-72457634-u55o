"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApiConfig } from '@/context/ApiConfigContext';
import { useApiCall } from '@/lib/apiUtils';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function Hero1() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { apiBaseUrl, publicBaseUrl } = useApiConfig();
  const { user } = useAuth();

  // Use the new API utility hook for fetching hero images
  const { data: mediaData, loading, error } = useApiCall<{ heroImages: string[] }>({
    url: publicBaseUrl
        ? `${publicBaseUrl}media`
        : user?._id 
          ? `${apiBaseUrl}getmedia?userId=${user._id}`
          : `${apiBaseUrl}getmedia`,
    dependencies: [apiBaseUrl, publicBaseUrl, user?._id],
  });

  const heroImages = useMemo(() => mediaData?.heroImages || [], [mediaData?.heroImages]);

  // Memoize slide navigation functions to prevent unnecessary re-renders
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    setIsAutoPlaying(false);
  }, [heroImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    setIsAutoPlaying(false);
  }, [heroImages.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  // Optimized auto-play effect with proper cleanup
  useEffect(() => {
    if (!isAutoPlaying || heroImages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, heroImages.length]);

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-100">
      {loading ? (
        <div className="flex items-center justify-center w-full h-full animate-pulse bg-gray-200">
          <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-200">
          <p className="text-gray-500">Failed to load hero images</p>
        </div>
      ) : heroImages.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-200">
          <p className="text-gray-500">No hero images available</p>
        </div>
      ) : (
        <>
          {/* Image Slides */}
          <div className="relative w-full h-full">
            {heroImages.map((image, index) => (
           <div
           key={index}
           className={`absolute w-full h-full transition-opacity duration-500 ${
             index === currentSlide ? "opacity-100" : "opacity-0"
           }`}
         >
           <Image
             src={image}
             alt={`Hero image ${index + 1}`}
             fill
             className="object-cover object-center"
             sizes="100vw"
             priority={index === 0}
             onError={(e) => {
               // Fallback to a placeholder if image fails to load
               const target = e.target as HTMLImageElement;
               target.src = '/placeholder.png';
             }}
           />
         </div>
         
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 sm:p-2 rounded-full transition-all z-10"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 sm:p-2 rounded-full transition-all z-10"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition ${
                  index === currentSlide ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play control */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
            <button
              onClick={toggleAutoPlay}
              className="bg-black/30 hover:bg-black/50 text-white p-1 sm:p-2 rounded-full"
              aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlaying ? (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
