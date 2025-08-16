export interface CartItem {
  _id: string;
  cartId: string;
  name: string;
  salePrice: number;
  quantity: number;
  images: string[];
  color?: string; // Optional if some items may not have a color
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Omit<CartItem, 'cartId' | 'quantity'>,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateItemQuantity: (
    cartId: string,
    type: 'increase' | 'decrease'
  ) => Promise<void>;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  buyNow: (
    product: Omit<CartItem, 'cartId' | 'quantity'> & { _id: string },
    quantity: number
  ) => void;
}

export interface CartStateContextType {
  isCartOpen: boolean;
  toggleCart: () => void;
  itemCount: number;
}

export interface CartDetailsContextType {
  cartDetails: {
    items: CartItem[];
    total: number;
  };
  saveCartDetails: (details: CartDetailsContextType['cartDetails']) => void;
}
