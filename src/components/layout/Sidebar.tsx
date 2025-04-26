
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  FileText,
  Users,
  Settings,
  PanelLeft,
  BookOpen,
  FolderOpenDot,
  FilePlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isActive }) => {
  return (
    <NavLink to={to} className={({ isActive }) => cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
    )}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <aside className={cn(
      "border-r bg-background transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-screen">
        <div className="h-16 border-b flex items-center justify-between px-4">
          {!collapsed && (
            <div className="font-poppins font-semibold tracking-tight">
              Articles<span className="text-primary">Hub</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-1">
            <NavItem to="/articles" icon={Home} label={collapsed ? "" : "Home"} />
            <NavItem to="/articles/explore" icon={BookOpen} label={collapsed ? "" : "Explore"} />
          </div>
          
          {isAdmin && (
            <>
              <Separator className="my-3" />
              <div className="text-xs font-medium text-muted-foreground mb-2 px-3">
                {collapsed ? "" : "Admin"}
              </div>
              <div className="space-y-1">
                <NavItem to="/admin/categories" icon={FolderOpenDot} label={collapsed ? "" : "Categories"} />
                <NavItem to="/admin/articles" icon={FileText} label={collapsed ? "" : "Articles"} />
                <NavItem to="/admin/articles/create" icon={FilePlus} label={collapsed ? "" : "Create Article"} />
                <NavItem to="/admin/users" icon={Users} label={collapsed ? "" : "Users"} />
                <NavItem to="/admin/settings" icon={Settings} label={collapsed ? "" : "Settings"} />
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
};
