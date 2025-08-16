import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/Cart/CartProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar5 from '@/components/Navbar/Navbar5';
import Footer1 from '@/components/Footer/Footer1';
import FloatingCartBox from '@/components/Cart/FloatingCartBox';
import { ApiConfigProvider } from '@/context/ApiConfigContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'user2',
  description: 'Generated e-commerce website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <CartProvider>
                <ApiConfigProvider apiId={1} storeId="68985dc8b866be5ac50c15f9">
                  <Navbar5 />
                  {children}
                  <Footer1 />
                  <FloatingCartBox />
                </ApiConfigProvider>
              </CartProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}