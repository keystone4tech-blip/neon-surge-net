import { Home, CreditCard, User, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/pricing", label: "Тарифы", icon: CreditCard },
  { href: "/profile", label: "Профиль", icon: User },
  { href: "/admin", label: "Админ", icon: Shield },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-primary neon-glow-cyan"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon
                className={`h-5 w-5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
