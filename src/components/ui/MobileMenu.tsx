import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  gradient: string;
  iconColor: string;
}

interface MobileMenuProps {
  items: MenuItem[];
  activeItem: string;
  onItemClick: (label: string) => void;
  currentWorkspace: string | null;
  onWorkspaceChange: (workspaceId: string) => Promise<void>;
}

export function MobileMenu({
  items,
  activeItem,
  onItemClick,
  currentWorkspace,
  onWorkspaceChange,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const handleItemClick = (label: string) => {
    onItemClick(label);
    setOpen(false); // Close menu after navigation
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden glass hover:glass-medium"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[350px] glass-heavy">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-bold">
            Menu de Navegação
          </SheetTitle>
        </SheetHeader>

        {/* Workspace Selector Mobile */}
        <div className="mt-6 mb-4 pb-4 border-b border-border/50">
          <WorkspaceSelector
            current={currentWorkspace}
            onChange={onWorkspaceChange}
          />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2 mt-6">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeItem;

            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item.label)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "glass-medium text-foreground shadow-lg"
                    : "glass hover:glass-medium text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Glow Background */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    isActive ? "opacity-100" : "group-hover:opacity-50"
                  )}
                  style={{ background: item.gradient }}
                />

                {/* Icon */}
                <Icon
                  className={cn(
                    "h-5 w-5 relative z-10 transition-colors duration-300",
                    isActive ? item.iconColor : "group-hover:" + item.iconColor
                  )}
                />

                {/* Label */}
                <span className="relative z-10 font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
