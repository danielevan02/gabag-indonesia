import Header from "@/components/shared/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col mt-36">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
