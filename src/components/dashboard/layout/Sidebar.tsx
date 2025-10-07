import { NavLink, useLocation } from "react-router-dom";
import { Home, TrendingUp, Facebook, Search, MapPin, Calculator, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import logoZion from "@/assets/logo-zion.jpg";

const menuItems = [
  { title: "Visão Geral", url: "/", icon: Home },
  { title: "Mês vs Dia", url: "/mes-vs-dia", icon: TrendingUp },
  { title: "Facebook ADS", url: "/facebook-ads", icon: Facebook },
  { title: "Google ADS", url: "/google-ads", icon: Search },
  { title: "Rastreamento", url: "/rastreamento", icon: MapPin },
  { title: "Calculadoras", url: "/calculadoras", icon: Calculator },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40 
        ${collapsed ? 'w-16' : 'w-60'}
        transition-all duration-300 ease-in-out
        glass-medium border-r border-border/50
      `}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b border-border/50 px-4">
        {collapsed ? (
          <img src={logoZion} alt="Zion" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="flex items-center gap-3">
            <img src={logoZion} alt="Zion" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Zion</h1>
              <p className="text-xs text-muted-foreground">Analytics</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl
                transition-all duration-200
                ${active 
                  ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-glow-blue' 
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground border-l-4 border-transparent'
                }
              `}
            >
              <Icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.title}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-24 
          w-6 h-6 rounded-full 
          glass-medium border border-border/50
          flex items-center justify-center
          hover:bg-primary/10 hover:border-primary/50
          transition-all duration-200
        "
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
};
