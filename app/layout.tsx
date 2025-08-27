import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, BASE_URL } from "@/lib/constants";
import { Toaster} from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { EdgeStoreProvider } from "@/lib/edge-store";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${outift.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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