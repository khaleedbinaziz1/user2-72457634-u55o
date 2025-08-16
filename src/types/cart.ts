export interface CartItem {
  cartId: string;
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  images?: string[];
  color?: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'cartId' | 'quantity'>, quantity: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateItemQuantity: (cartId: string, type: 'increase' | 'decrease') => Promise<void>;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
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
  saveCartDetails: (details: { items: CartItem[]; total: number }) => void;
} 