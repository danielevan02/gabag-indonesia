import Footer from "@/components/shared/footer";
import Header from "@/components/shared/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative max-w-[2500px]">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
