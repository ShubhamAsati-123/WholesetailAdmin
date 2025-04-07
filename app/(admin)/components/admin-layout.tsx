import type { ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
          <div className="flex h-14 items-center border-b px-4">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg">Wholesetail Admin</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-4 px-4">
            <SidebarNav />
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
