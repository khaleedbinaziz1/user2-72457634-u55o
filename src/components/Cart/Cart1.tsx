'use client';

import React, { useState, useEffect,  } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, } from './CartProvider';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaShoppingBag, FaCheckCircle, FaTruck } from 'react-icons/fa';
import { clearCart } from './cartService';
import Image from 'next/image';

import { CartItem } from './types';

export interface Cart1Props {
  isOpen: boolean;
  toggleCart: () => void;
  autoOpenOnAdd?: boolean;
}

interface CartNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  item?: CartItem;
}

// Enhanced Cart Notification Component
const CartNotification: React.FC<{
  notification: CartNotification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: 'bg-primary', icon: FaCheckCircle },
    error: { bg: 'bg-red-500', icon: FaTimes },
    info: { bg: 'bg-primary', icon: FaShoppingBag }
  }[notification.type];

  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-[9999] ${config.bg} text-white p-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-500 ease-out animate-slide-in-right max-w-[calc(100vw-2rem)] sm:max-w-sm`}>
      <div className="flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{notification.title}</p>
        <p className="text-xs opacity-90 truncate">{notification.message}</p>
      </div>
      
      <button 
        onClick={onClose} 
        className="flex-shrink-0 w-6 h-6 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  );
};

// Advanced Cart Item Component
const EnhancedCartItem: React.FC<{
  item: CartItem;
  index: number;
  onQuantityChange: (cartId: string, type: 'increase' | 'decrease') => void;
  onRemove: (cartId: string) => void;
}> = ({ item, index, onQuantityChange, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.cartId), 300);
  };

  const handleQuantityChange = async (type: 'increase' | 'decrease') => {
    setIsUpdating(true);
    onQuantityChange(item.cartId, type);
    setTimeout(() => setIsUpdating(false), 200);
  };

  const itemTotal = item.salePrice * item.quantity;

  return (
    <div 
      className={`group relative bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform transition-all duration-300 border border-gray-100 ${
        isRemoving ? 'animate-slide-out-right opacity-0 scale-95' : 'animate-slide-in-up'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3">
        {/* Product Image */}
    <div className="relative">
  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
    <Image
      src={item.images[0] || '/placeholder.png'}
      alt={item.name}
      width={64}
      height={64}
      className="w-full h-full object-cover"
    />
  </div>


          {/* Quantity badge */}
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
            {item.quantity}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 text-sm leading-tight mb-1 truncate">
            {item.name}
          </h3>
          
          {/* Color indicator */}
          {item.color && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Color:</span>
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ৳{itemTotal.toFixed(0)}
            </span>
            <span className="text-xs text-gray-400">
              (৳{(item.salePrice)} each)
            </span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => handleQuantityChange('decrease')}
              disabled={item.quantity <= 1 || isUpdating}
              className="w-7 h-7 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaMinus className="w-3 h-3 text-gray-600" />
            </button>
            
            <span className={`w-8 text-center font-medium text-gray-800 transition-all duration-200 ${
              isUpdating ? 'scale-110 text-primary' : ''
            }`}>
              {item.quantity}
            </span>
            
            <button
              onClick={() => handleQuantityChange('increase')}
              disabled={isUpdating}
              className="w-7 h-7 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-200 disabled:opacity-50"
            >
              <FaPlus className="w-3 h-3 text-gray-600" />
            </button>
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all duration-200"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Cart Component
const Cart1: React.FC<Cart1Props> = ({ isOpen, toggleCart, }) => {
  const { cartItems, removeFromCart, totalPrice, updateItemQuantity } = useCart();
  const router = useRouter();
  const [notifications, setNotifications] = useState<CartNotification[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
 



  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    // Simulate checkout loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('cartDetails', JSON.stringify({ 
      items: cartItems, 
      total: totalPrice.toFixed(0) 
    }));
    
    clearCart();
    router.push('/pages/checkout');
    toggleCart();
    setIsCheckingOut(false);
  };

  const handleQuantityChange = (cartId: string, type: 'increase' | 'decrease') => {
    updateItemQuantity(cartId, type);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    
    const notification: CartNotification = {
      id: Date.now().toString(),
      type: 'info',
      title: 'Cart cleared',
      message: 'All items have been removed'
    };
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Calculate cart summary
  const subtotal = totalPrice;
  const shipping = 0;
  const finalTotal = subtotal + shipping;
  const freeShippingThreshold = 1000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <>
      {/* Cart Drawer */}
      <div
        className={`fixed inset-0 z-[1101] flex justify-end items-start transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        {/* Backdrop */}
        {isOpen && (
          <div
            onClick={toggleCart}
            className="absolute inset-0 bg-black/50 transition-all duration-300 animate-fade-in"
          />
        )}

        {/* Cart Panel */}
        <div className={`w-full h-full sm:w-96 bg-white shadow-xl transform transition-all duration-500 ease-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-primary p-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FaShoppingBag className="w-5 h-5" />
                    Shopping Cart
                  </h2>
                  <p className="text-sm opacity-90">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {cartItems.length > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={toggleCart}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Free shipping progress */}
              {remainingForFreeShipping > 0 && cartItems.length > 0 && (
                <div className="mt-3 bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTruck className="w-4 h-4" />
                    <span className="text-sm">
                      Add ৳{remainingForFreeShipping.toFixed(0)} more for free shipping!
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {cartItems.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-gray-500 p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FaShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
                  <p className="text-center text-gray-500 text-sm">
                    Add some products to get started!
                  </p>
                  <button
                    onClick={toggleCart}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {cartItems.map((item, index) => (
                    <EnhancedCartItem
                      key={item.cartId}
                      item={item}
                      index={index}
                      onQuantityChange={handleQuantityChange}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Cart Summary */}
            {cartItems.length > 0 && (
              <div className="bg-white border-t border-gray-200 p-4 space-y-3">
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                <span>৳{(subtotal ?? 0).toFixed(0)}</span>

                  </div>
                
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ৳{finalTotal.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  className={`w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCheckingOut ? 'animate-pulse' : ''
                  }`}
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || isCheckingOut}
                >
                  {isCheckingOut ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaShoppingBag className="w-4 h-4" />
                      Checkout ৳{finalTotal.toFixed(0)}
                    </div>
                  )}
                </button>

                <button 
                  onClick={toggleCart}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-xs w-full shadow-xl transform animate-scale-in">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTrash className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Cart?</h3>
              <p className="text-gray-600 mb-4 text-sm">This will remove all items from your cart.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-0 right-0 z-[9999] p-4 space-y-2">
        {notifications.map(notification => (
          <CartNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-out-right {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes slide-in-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        .animate-slide-out-right {
          animation: slide-out-right 0.3s ease-in forwards;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Cart1;