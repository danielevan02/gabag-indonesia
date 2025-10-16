import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, BASE_URL } from "@/lib/constants";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/session-provider";

const outift = Outfit({
  subsets: ['latin'],
  weight: ['200', '400', '500', '600', '700', '900'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    template: `%s | Gabag Indonesia`,
    default: APP_NAME
  },
  keywords: "pompa asi, tas cooler, gabag, breastpump, kolibri, perlengkapan bayi",
  description: APP_DESCRIPTION,
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Gabag Indonesia - Pompa ASI & Tas Cooler Premium",
    description: APP_DESCRIPTION,
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabag Indonesia - Pompa ASI & Tas Cooler Premium",
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body className={`${outift.className}`}>
        <AuthProvider>
          <TRPCProvider>
            <main>
              {children}
              <Toaster position="top-center"/>
            </main>
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
