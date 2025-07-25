import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home,
  Calendar, 
  Heart, 
  DollarSign, 
  Users
} from "lucide-react";

const BottomNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/schedule", icon: Calendar, label: "Schedule" },
    { path: "/health", icon: Heart, label: "Health" },
    { path: "/finance", icon: DollarSign, label: "Finance" },
    { path: "/family", icon: Users, label: "Family" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border/50 shadow-widget">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} to={item.path}>
              <Button 
                variant="ghost" 
                className={`flex-col gap-1 h-auto py-2 ${
                  active 
                    ? 'text-primary bg-primary/10' 
                    : 'hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className={`text-xs ${active ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;