export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center overflow-scroll">
      <div className="relative max-w-[2500px]">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
