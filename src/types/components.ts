export interface NavbarProps {
  logo: string | null | undefined;
}

export interface HeroProps {
  heroPreviews: string[];
}

export interface CartProps {
  isOpen: boolean;
  toggleCart: () => void;
}

export interface ProductDetailProps {
  product: {
    _id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    category: string;
  };
}

export interface TopCategoriesProps {
  categories?: Array<{
    id: string;
    name: string;
    image: string;
  }>;
}

export interface ProductSectionProps {
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

export interface FooterProps {
  logo?: string;
  links?: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
    }>;
  }>;
}

export interface CheckoutProps {
  cart?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
} 