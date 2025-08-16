'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useApiConfig } from '@/context/ApiConfigContext';
import { useAuth } from '@/context/AuthContext';

interface Category {
  _id: string;
  name: string;
  img: string;
  created_time: string;
  updated_time: string;
}

interface TopCategories5Props {
  onCategoryClick?: (categoryName: string) => void;
}

const TopCategories5 = ({ onCategoryClick }: TopCategories5Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { apiBaseUrl, publicBaseUrl } = useApiConfig();
  const { user } = useAuth();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const url = publicBaseUrl
          ? `${publicBaseUrl}categories`
          : user?._id
            ? `${apiBaseUrl}categories?userId=${user._id}`
            : `${apiBaseUrl}categories`;
        const response = await axios.get(url);
        setCategories(response.data.slice(0, 5));
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [apiBaseUrl, publicBaseUrl, user?._id]);

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="flex flex-wrap justify-center gap-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Categories</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group"
              onClick={() => onCategoryClick?.(category.name)}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors overflow-hidden">
                  <div className="relative w-10 h-10">
                    <Image
                      src={category.img}
                      alt={category.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 group-hover:text-purple-600">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCategories5; 