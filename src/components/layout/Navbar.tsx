
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/UserNav";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/" className="flex items-center">
          <img
            src="/placeholder.svg"
            alt="Logo"
            className="h-8 w-8 mr-2"
          />
          <h1 className="text-lg font-bold">Admin</h1>
        </Link>
      </div>

      <div className="hidden md:flex md:items-center">
        <Link to="/" className="flex items-center">
          <img
            src="/placeholder.svg"
            alt="Logo"
            className="h-8 w-8 mr-2"
          />
          <h1 className="text-lg font-bold">Admin</h1>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
        <UserNav />
      </div>
    </header>
  );
};
