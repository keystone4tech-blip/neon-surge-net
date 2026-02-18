import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import TariffCard from "@/components/TariffCard";
import { motion } from "framer-motion";

const tariffs = [
  {
    name: "Старт",
    duration: "1 месяц",
    price: 150,
    pricePerMonth: 150,
    features: ["WireGuard протокол", "Безлимитный трафик", "1 устройство", "10+ серверов"],
  },
  {
    name: "Оптимальный",
    duration: "3 месяца",
    price: 400,
    pricePerMonth: 133,
    savings: "50₽",
    features: ["Все из «Старт»", "3 устройства", "Приоритетная поддержка", "Выбор сервера"],
  },
  {
    name: "Продвинутый",
    duration: "6 месяцев",
    price: 700,
    pricePerMonth: 117,
    popular: true,
    savings: "200₽",
    features: ["Все из «Оптимальный»", "5 устройств", "Выделенный IP", "Ранний доступ"],
  },
  {
    name: "Максимум",
    duration: "1 год",
    price: 1200,
    pricePerMonth: 100,
    savings: "600₽",
    features: ["Все из «Продвинутый»", "10 устройств", "VIP поддержка", "Бонус +30 дней"],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold tracking-wider text-foreground md:text-4xl">
              Выбери <span className="neon-text-purple">тариф</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              7 дней бесплатного триала на каждом тарифе
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tariffs.map((t, i) => (
              <TariffCard key={i} {...t} onSelect={() => {}} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display text-xs tracking-widest">
            NEXUS<span className="text-primary">VPN</span> © 2025
          </p>
          <p className="mt-2">Безопасность и свобода в интернете</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
