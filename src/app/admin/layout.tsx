import { auth } from "@/auth";
import { AppSidebar } from "@/components/admin/app-sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Globe } from "lucide-react";
import Link from "next/link";

import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/");
  }
  return (
    <div className="flex flex-col items-center">
      <div className="relative max-w-[2500px] w-full max-h-screen">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="max-h-screen">
            <header className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear h-fit">
              <div className="flex items-center gap-2 px-4 w-full">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="hidden md:flex items-center gap-3 justify-center flex-1 py-2">
                  <h1 className="text-2xl md:text-lg tracking-widest uppercase">Admin Panel</h1>
                  <Image
                    src="/images/black-logo.svg"
                    alt="Gabag's Logo"
                    width={130}
                    height={90}
                    className="md:w-28 xl:w-36"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild className="rounded-full ml-5">
                          <Link href="/" className="text-sm uppercase">
                            <Globe className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Go to Gabag&apos;s Website</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-hidden">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
