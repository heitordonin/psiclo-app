import { NavLink } from "react-router-dom";
import { Home, ArrowLeftRight, PieChart, BarChart3, User, Target } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transações" },
  { to: "/spending-goals", icon: PieChart, label: "Gastos" },
  { to: "/goals", icon: Target, label: "Metas" },
  { to: "/reports", icon: BarChart3, label: "Relatórios" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="flex items-center justify-between px-1 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-2 text-[10px] transition-colors min-w-0 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-5 w-5 ${isActive ? "fill-primary" : ""}`} />
                <span className="font-medium truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
