'use client';

import React, { useState, useEffect } from 'react';
import { FaShoppingBasket, FaShoppingBag, } from 'react-icons/fa';
import { useCart } from './CartProvider';
import Cart1 from './Cart1';
import Image from 'next/image';

interface FloatingCartBoxProps {
  className?: string;
}

const FloatingCartBox: React.FC<FloatingCartBoxProps> = ({ 
  className = ''
}) => {
  const { cartItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVisible] = useState(true);
  const [bounce, setBounce] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  

  // Bounce animation when items are added
  useEffect(() => {
    if (totalItems > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 800);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      {/* Floating Basket Cart */}
      <div
        className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-[1100] transition-all duration-500 ease-out ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Basket Container */}
        <div className={`relative transition-all duration-300 ${isHovered ? 'transform -translate-x-2' : ''}`}>
          
          {/* Basket Button */}
          <button
            onClick={toggleCart}
            className={`group relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 text-white rounded-l-3xl shadow-2xl hover:shadow-orange-500/25 transform transition-all duration-300 hover:scale-105 active:scale-95 ${
              bounce ? 'animate-wiggle' : ''
            } ${totalItems > 0 ? 'ring-4 ring-orange-200 ring-opacity-60' : ''}`}
            style={{
              padding: '20px 25px 20px 30px',
              borderTopRightRadius: '0',
              borderBottomRightRadius: '0'
            }}
            aria-label={`Shopping basket with ${totalItems} items`}
          >
            {/* Basket Icon with Items */}
            <div className="relative">
              <FaShoppingBasket className="w-8 h-8 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              
              {/* Floating Items in Basket */}
              {totalItems > 0 && (
                <>
                  {/* Small item dots */}
                  <div className="absolute -top-1 left-1 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="absolute -top-2 right-0 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="absolute -top-1 right-2 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </>
              )}
              
              {/* Item Count Badge */}
              {totalItems > 0 && (
                <div className="absolute -top-4 -right-4 bg-red-500 text-white text-sm font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 shadow-lg animate-pulse border-2 border-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </div>
              )}
            </div>

            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-l-3xl bg-white opacity-0 group-active:opacity-20 transition-opacity duration-200"></div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-l-3xl bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300 -z-10"></div>
          </button>

          {/* Side Label */}
          <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full bg-orange-500 text-white px-3 py-2 rounded-l-lg shadow-lg transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-[-100%]' : 'opacity-0 translate-x-[-80%]'
          }`}>
            <div className="text-xs font-medium whitespace-nowrap">
              {totalItems === 0 ? 'Your Basket' : `${totalItems} Items`}
            </div>
          </div>

          {/* Quick Preview Panel */}
          {totalItems > 0 && (
            <div className={`absolute right-full top-0 mr-4 w-80 bg-white rounded-2xl shadow-2xl border-2 border-orange-100 transition-all duration-300 transform ${
              isHovered ? 'opacity-100 visible translate-x-0 scale-100' : 'opacity-0 invisible translate-x-4 scale-95'
            } pointer-events-none`}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <FaShoppingBasket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Your Basket</h3>
                    <p className="text-sm text-gray-500">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for checkout
                    </p>
                  </div>
                </div>
                
                {/* Items Preview */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cartItems.slice(0, 4).map((item) => (
                    <div key={item.cartId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                        {item.images?.[0] || item.images[0] ? (
                          <Image
                          width={50}
                          height={50}
                            src={item.images?.[0] || item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FaShoppingBag className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium text-sm truncate">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          <span className="text-orange-600 font-bold text-sm">
                            ৳{item.salePrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {cartItems.length > 4 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">
                        +{cartItems.length - 4} more items
                      </p>
                    </div>
                  )}
                </div>

                {/* Total Section */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ৳{cartItems.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0).toFixed(0)}
                    </span>
                  </div>
                  
                  {/* Action Hint */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 text-center">
                    <p className="text-sm text-orange-700 font-medium">
                      🛒 Click the basket to view & checkout
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow Pointer */}
              <div className="absolute left-full top-8 w-0 h-0 border-t-[12px] border-b-[12px] border-l-[12px] border-t-transparent border-b-transparent border-l-orange-100"></div>
              <div className="absolute left-full top-8 ml-0.5 w-0 h-0 border-t-[10px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-white"></div>
            </div>
          )}
        </div>
      </div>

      {/* Empty Basket Pulse Ring */}
      {totalItems === 0 && (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-[1099] pointer-events-none">
          <div className="w-20 h-20 bg-orange-200 rounded-full animate-ping opacity-20" style={{ marginRight: '4px' }}></div>
        </div>
      )}

      {/* Cart1 Component */}
      <Cart1 
        isOpen={isCartOpen} 
        toggleCart={toggleCart} 
        autoOpenOnAdd={false}
      />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes wiggle {
          0%, 7% { transform: rotateZ(0deg); }
          15% { transform: rotateZ(-15deg); }
          20% { transform: rotateZ(10deg); }
          25% { transform: rotateZ(-10deg); }
          30% { transform: rotateZ(6deg); }
          35% { transform: rotateZ(-4deg); }
          40%, 100% { transform: rotateZ(0deg); }
        }
        
        .animate-wiggle {
          animation: wiggle 0.8s ease-in-out;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        /* Custom scrollbar for preview */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #ffa500;
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #ff8c00;
        }
      `}</style>
    </>
  );
};

export default FloatingCartBox;