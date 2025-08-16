export interface WebsiteGeneration {
  _id?: string;
  projectName: string;
  selection: {
    navbar: string;
    topCategories: string;
    hero: string;
    footer: string;
    cart: string;
    productSection: string;
    productDetail: string;
    checkout: string;
    theme?: {
      colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        text?: string;
      };
      typography?: {
        headingFont?: string;
        bodyFont?: string;
        baseSize?: string;
        scale?: string;
      };
    };
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  projectPath?: string;
  url?: string;
} 