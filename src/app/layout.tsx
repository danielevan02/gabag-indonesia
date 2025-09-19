import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import { APP_DESCRIPTION, APP_NAME, BASE_URL } from "@/lib/constants";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const outift = Outfit({
  subsets: ['latin'],
  weight: [
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
  ]
})

export const metadata: Metadata = {
  title: {
    template: `%s | Gabag Indonesia`,
    default: APP_NAME
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(BASE_URL)
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCProvider>
      <html lang="en">
        <body className={`${outift.className}`}>
          <main>
            {children}
            <Toaster position="top-center"/>
          </main>
        </body>
      </html>
    </TRPCProvider>
  );
}
