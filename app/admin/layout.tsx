import { auth } from "@/auth";
import AdminHeader from "@/components/admin/shared/header";
import AdminSidebar from "@/components/admin/shared/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <div className="flex flex-col items-center">
      <div className="relative max-w-[2500px] w-full">
        <SidebarProvider>
          <AdminSidebar />

          <div className="flex flex-col w-full">
            <AdminHeader user={session?.user}/>
            <main className="flex-1">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
