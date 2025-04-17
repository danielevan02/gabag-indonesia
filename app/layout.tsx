import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, BASE_URL } from "@/lib/constants";
import { Toaster} from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { EdgeStoreProvider } from "@/lib/edge-store";

const outift = Poppins({
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
    <html lang="en" className={`${outift.className} antialiased`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SpeedInsights />
          <EdgeStoreProvider>
            <main>
              {children}
              <Toaster position="top-center"/>
            </main>
          </EdgeStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}