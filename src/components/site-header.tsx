import { useLocation } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/":
      case "/dashboard":
        return "Dashboard";
      case "/master/perusahaan":
        return "Master Perusahaan";
      case "/master/departemen":
        return "Master Departemen";
      case "/master/jabatan":
        return "Master Jabatan";
      case "/master/karyawan":
        return "Master Karyawan";
      case "/master/user-role":
        return "User & Role Management";
      default:
        // Fallback untuk route yang belum didefinisikan secara eksplisit
        // Mengubah /foo/bar menjadi Foo Bar
        return (
          pathname
            .split("/")
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(" ") || "Dashboard"
        );
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
