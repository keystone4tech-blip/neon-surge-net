import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden cyber-grid">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-[120px]" />

      <div className="container relative mx-auto px-4 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary neon-border-cyan">
              <Shield className="h-3.5 w-3.5" />
              7 дней бесплатно · Без логов · WireGuard
            </div>

            <h1 className="font-display text-4xl font-black leading-tight tracking-wider text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Интернет без
              <br />
              <span className="neon-text-cyan">границ</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
              Быстрый VPN на базе WireGuard. Полная анонимность, без логов, серверы по всему миру.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link to="/pricing">
              <Button variant="cyber" size="xl" className="glitch-hover">
                Начать бесплатно <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="cyber-outline" size="lg">
                Тарифы от 150₽/мес
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            {["AES-256 шифрование", "10+ серверов", "Все платформы", "24/7 поддержка"].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
