import React, { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}
      <div className="flex-1">
        <Navbar toggleSidebar={toggleSidebar} />
        <ScrollArea className="flex-1 h-[calc(100vh-4rem)] px-4 py-4 md:p-6">
          <main className="max-w-7xl mx-auto">{children}</main>
        </ScrollArea>
      </div>
    </div>
  );
};
