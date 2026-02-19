import { Shield, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const links = [
    { href: "/", label: "Главная" },
    { href: "/pricing", label: "Тарифы" },
    ...(user ? [{ href: "/profile", label: "Профиль" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Админ" }] : []),
  ];

  const handleAuth = async () => {
    if (user) {
      await signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full">
      {/* Animated gradient border bottom */}
      <div className="relative glass-strong">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 neon-border-cyan">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-lg md:text-sm font-bold tracking-widest animated-gradient-text flex-1 text-center md:text-left md:flex-none">
              MozhnoVPN
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
            <Button variant="cyber" size="sm" className="ml-2" onClick={handleAuth}>
              {user ? (
                <>
                  <LogOut className="h-4 w-4" /> Выйти
                </>
              ) : (
                <>
                  <User className="h-4 w-4" /> Войти
                </>
              )}
            </Button>
          </div>
        </div>
        {/* Animated gradient line at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] animated-gradient-border" />
      </div>
    </nav>
  );
};

export default Navbar;
