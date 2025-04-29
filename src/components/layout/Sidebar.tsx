
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  FilePlus,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  exact?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, exact = false, onClick }) => {
  const location = useLocation();
  
  // Custom isActive logic
  const isPathActive = () => {
    if (exact) {
      return location.pathname === to;
    }
    
    // Special case for Create Article
    if (to === "/admin/articles/create" && location.pathname === to) {
      return true;
    }
    
    // Special case for Articles menu
    if (to === "/admin/articles" && location.pathname === to) {
      return true;
    }
    
    // Special case for Explore
    if (to === "/articles/explore" && location.pathname === to) {
      return true;
    }
    
    // For all other cases
    return location.pathname === to;
  };

  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        isPathActive() ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
};

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, setIsOpen }) => {
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const isMobile = useIsMobile();
  
  // Close sidebar handler for mobile
  const closeSidebar = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };
  
  // For desktop sidebar
  const renderSidebarContent = () => (
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
          <NavItem to="/articles" icon={Home} label={collapsed ? "" : "Home"} exact={true} />
          <NavItem to="/articles/explore" icon={BookOpen} label={collapsed ? "" : "Explore"} exact={true} />
        </div>
        
        {isAdmin && (
          <>
            <Separator className="my-3" />
            <div className="text-xs font-medium text-muted-foreground mb-2 px-3">
              {collapsed ? "" : "Admin"}
            </div>
            <div className="space-y-1">
              <NavItem to="/admin/categories" icon={FolderOpenDot} label={collapsed ? "" : "Categories"} exact={true} />
              <NavItem to="/admin/articles" icon={FileText} label={collapsed ? "" : "Articles"} exact={true} />
              <NavItem to="/admin/articles/create" icon={FilePlus} label={collapsed ? "" : "Create Article"} exact={true} />
              <NavItem to="/admin/users" icon={Users} label={collapsed ? "" : "Users"} exact={true} />
              <NavItem to="/admin/settings" icon={Settings} label={collapsed ? "" : "Settings"} exact={true} />
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );

  // For mobile view, use the Sheet component
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-[250px] max-w-[250px]">
          <div className="flex flex-col h-full">
            <div className="h-16 border-b flex items-center justify-between px-4">
              <div className="font-poppins font-semibold tracking-tight">
                Articles<span className="text-primary">Hub</span>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetClose>
            </div>
            
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-1">
                <NavItem to="/articles" icon={Home} label="Home" exact={true} onClick={closeSidebar} />
                <NavItem to="/articles/explore" icon={BookOpen} label="Explore" exact={true} onClick={closeSidebar} />
              </div>
              
              {isAdmin && (
                <>
                  <Separator className="my-3" />
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-3">
                    Admin
                  </div>
                  <div className="space-y-1">
                    <NavItem to="/admin/categories" icon={FolderOpenDot} label="Categories" exact={true} onClick={closeSidebar} />
                    <NavItem to="/admin/articles" icon={FileText} label="Articles" exact={true} onClick={closeSidebar} />
                    <NavItem to="/admin/articles/create" icon={FilePlus} label="Create Article" exact={true} onClick={closeSidebar} />
                    <NavItem to="/admin/users" icon={Users} label="Users" exact={true} onClick={closeSidebar} />
                    <NavItem to="/admin/settings" icon={Settings} label="Settings" exact={true} onClick={closeSidebar} />
                  </div>
                </>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop view
  return (
    <aside className={cn(
      "border-r bg-background transition-all duration-300 ease-in-out hidden md:block",
      collapsed ? "w-16" : "w-64"
    )}>
      {renderSidebarContent()}
    </aside>
  );
};
