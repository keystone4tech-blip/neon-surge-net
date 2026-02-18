import { motion } from "framer-motion";
import { Shield, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { href: "/", label: "Главная" },
    { href: "/pricing", label: "Тарифы" },
    { href: "/profile", label: "Профиль" },
    { href: "/admin", label: "Админ" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full glass-strong">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 neon-border-cyan">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-sm font-bold tracking-widest text-foreground">
            NEXUS<span className="text-primary">VPN</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} to={l.href}>
              <Button
                variant="ghost"
                size="sm"
                className={location.pathname === l.href ? "text-primary" : "text-muted-foreground"}
              >
                {l.label}
              </Button>
            </Link>
          ))}
          <Button variant="cyber" size="sm" className="ml-2">
            <User className="h-4 w-4" /> Войти
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-strong border-t border-border/50 md:hidden"
        >
          <div className="flex flex-col gap-1 p-4">
            {links.map((l) => (
              <Link key={l.href} to={l.href} onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  {l.label}
                </Button>
              </Link>
            ))}
            <Button variant="cyber" className="mt-2">
              <User className="h-4 w-4" /> Войти
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
