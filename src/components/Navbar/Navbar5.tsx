"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaPhone, FaSearch } from 'react-icons/fa';
import Fuse from 'fuse.js';
import { useApiConfig } from '@/context/ApiConfigContext';
import { useAuth } from '@/context/AuthContext';

interface Category {
  _id: string;
  name: string;
  img: string;
}

interface Product {
  name: string;
  price: number;
  images: string[];
  showProduct: string;
  normalizedName: string;
}

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const Navbar5 = ({ phoneNumber = "+1234234234" }: { phoneNumber?: string }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState(true);

  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [fuse, setFuse] = useState<Fuse<Product> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const { apiBaseUrl, publicBaseUrl } = useApiConfig();
  const { user } = useAuth();
  const router = useRouter();

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      let url: string;
      // Use public endpoints for generated websites
      if (publicBaseUrl) {
        console.log('Using public endpoints for generated website');
        url = `${publicBaseUrl}categories`;
      } else {
        // Fallback to authenticated endpoints for builder
        console.log('Using authenticated endpoints for builder');
        url = user?._id 
          ? `${apiBaseUrl}categories?userId=${user._id}`
          : `${apiBaseUrl}categories`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data: Category[] = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [apiBaseUrl, publicBaseUrl, user?._id]);

  const fetchLogo = useCallback(async () => {
    try {
      const url = publicBaseUrl
        ? `${publicBaseUrl}media`
        : user?._id 
          ? `${apiBaseUrl}getmedia?userId=${user._id}`
          : `${apiBaseUrl}getmedia`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.logo) {
        setLogoUrl(data.logo);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    } finally {
      setLoadingLogo(false);
    }
  }, [apiBaseUrl, publicBaseUrl, user?._id]);

  const fetchProducts = useCallback(async () => {
    try {
      const url = publicBaseUrl
        ? `${publicBaseUrl}products`
        : user?._id 
          ? `${apiBaseUrl}products?userId=${user._id}`
          : `${apiBaseUrl}products`;
      const response = await fetch(url);
      const data: Product[] = await response.json();

      const normalizedProducts = data.map(product => ({
        ...product,
        normalizedName: normalizeString(product.name)
      })).filter(product => product.showProduct === 'On');

      const fuseInstance = new Fuse(normalizedProducts, {
        keys: ['normalizedName'],
        threshold: 0.2,
        distance: 200,
        minMatchCharLength: 2,
        shouldSort: true
      });

      setFuse(fuseInstance);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [apiBaseUrl, publicBaseUrl, user?._id]);

  const handleResize = useCallback(() => {}, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsSidebarOpen(false);
    }
    if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    handleResize();
    fetchCategories();
    fetchLogo();
    fetchProducts();
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleResize, fetchCategories, fetchLogo, fetchProducts, handleClickOutside]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() && fuse) {
      const normalizedQuery = normalizeString(value);
      const fuzzyResults = fuse.search(normalizedQuery);
      const filteredSuggestions = fuzzyResults.map(result => result.item);
      setSuggestions(filteredSuggestions);
      router.push(`/products?q=${encodeURIComponent(value.trim())}`);
    } else {
      setSuggestions([]);
      router.push(`/products`);
    }
  }, [fuse, router]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      router.push(`/products?q=${encodeURIComponent(query)}`);
      setSuggestions([]);
    }
  }, [query, router]);

  const handleSuggestionClick = useCallback((suggestion: Product) => {
    const firstTwoWords = suggestion.name.split(' ').slice(0, 2).join(' ');
    const encodedQuery = encodeURIComponent(firstTwoWords);
    setQuery(firstTwoWords);
    setSuggestions([]);
    router.push(`/products?q=${encodedQuery}`);
  }, [router]);

  const handleSearchButtonClick = useCallback(() => {
    router.push(`/products?q=${encodeURIComponent(query)}`);
    setSuggestions([]);
  }, [query, router]);

  return (
    <header className="bg-secondary sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            {loadingLogo ? (
              <div className="w-32 h-10 bg-gray-200 animate-pulse" />
            ) : logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                width={140}
                height={56}
                className="h-10 lg:h-16 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                priority
              />
            ) : null}
          </Link>

          {/* Desktop Searchbar */}
          <div className="relative rounded-md w-full max-w-xl mx-4 hidden lg:block" ref={searchWrapperRef}>
            <div className="flex items-center bg-white shadow-md focus-within:ring-2 focus-within:ring-primary transition-all">
              <input
                ref={inputRef}
                type="text"
                className="flex-grow px-5 py-3 focus:outline-none text-base bg-transparent placeholder-gray-500"
                placeholder="Search for products..."
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
              />
              <button onClick={handleSearchButtonClick} className="p-4 bg-primary text-white hover:bg-primary transition-colors">
                <FaSearch className="w-5 h-5 text-secondary" />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute w-full bg-white border border-primary mt-1 shadow-2xl z-20 max-h-72 overflow-y-auto animate-fadeIn">
                <ul className="divide-y divide-gray-100">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Image
                        src={suggestion.images[0]}
                        alt={suggestion.name}
                        width={48}
                        height={48}
                        className="object-cover border border-gray-200"
                      />
                      <div>
                        <p className="text-base font-semibold text-gray-900 truncate">{suggestion.name}</p>
                        <p className="text-sm text-gray-600">৳{suggestion.price} BDT</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-5 py-2 shadow-md hover:shadow-lg transition-all">
              <FaPhone className="text-lg" />
              <span className="font-medium">{phoneNumber}</span>
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Searchbar - Always Visible */}
            <div className="relative flex-1 max-w-xs mx-2" ref={searchWrapperRef}>
              <div className="flex items-center bg-white border border-primary shadow-sm">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 focus:outline-none text-sm bg-transparent placeholder-gray-500"
                  placeholder="Search..."
                  value={query}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
                <button onClick={handleSearchButtonClick} className="p-2 bg-primary text-white">
                  <FaSearch className="w-4 h-4" />
                </button>
              </div>
              {suggestions.length > 0 && (
                <div className="absolute w-full bg-white border border-primary mt-1 shadow-2xl z-20 max-h-48 overflow-y-auto animate-fadeIn">
                  <ul className="divide-y divide-gray-100">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Image
                          src={suggestion.images[0]}
                          alt={suggestion.name}
                          width={32}
                          height={32}
                          className="object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{suggestion.name}</p>
                          <p className="text-xs text-gray-600">৳{suggestion.price} BDT</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button onClick={toggleSidebar} className="p-3 bg-secondary border-2 border-primary shadow-md">
              {isSidebarOpen ? <FaTimes className="text-xl text-primary" /> : <FaBars className="text-xl text-primary" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={toggleSidebar} />
      )}

      {/* Mobile Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white shadow-2xl transform transition-all duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary via-primary to-secondary">
          <span className="text-lg font-bold text-white">Menu</span>
          <button onClick={toggleSidebar} className="text-white text-2xl font-bold">×</button>
        </div>

        {/* Mobile Categories */}
        <div className="p-5">
          <h3 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary block" />
            Categories
          </h3>
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : categories.length > 0 ? (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat._id} className="flex items-center gap-3 p-2 hover:bg-primary/10 cursor-pointer transition-colors" onClick={() => { router.push(`/category/${cat._id}`); toggleSidebar(); }}>
                  <Image src={cat.img} alt={cat.name} width={28} height={28} />
                  <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500">No categories available</div>
          )}
        </div>

        {/* Mobile Auth */}
        <div className="p-5"></div>
      </aside>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>
    </header>
  );
};

export default Navbar5;
