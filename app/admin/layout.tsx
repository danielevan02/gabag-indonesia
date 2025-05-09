import { auth } from "@/auth";
import AdminHeader from "@/components/admin/shared/header";
import AdminSidebar from "@/components/admin/shared/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import QueryProvider from "@/lib/query-provider";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if(session?.user?.role !== 'admin'){
    redirect('/')
  }
  return (
    <div className="flex flex-col items-center">
      <div className="relative max-w-[2500px] w-full max-h-screen">
        <SidebarProvider>
          <AdminSidebar />
          <div className="flex flex-col w-full h-screen">
            <AdminHeader user={session?.user}/>
            <QueryProvider>
              <main className="flex-1 overflow-hidden">{children}</main>
            </QueryProvider>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
