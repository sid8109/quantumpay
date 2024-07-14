import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "../provider";
import { Comfortaa } from 'next/font/google'
import { Toaster } from "sonner";

const comfortaa = Comfortaa({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comfortaa',
})

export const metadata: Metadata = {
  title: "Wallet",
  description: "Wallet app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>
        <Providers>
          <body className={comfortaa.variable}>
            <Toaster position="top-right" richColors />
            <div className="bg-[#ebe6e6]">
              {children}
            </div>
          </body>
        </Providers>
      </body>
    </html>
  );
}