import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import TariffCard from "@/components/TariffCard";
import { motion } from "framer-motion";
import { useTariffs } from "@/hooks/useTariffs";
import { Skeleton } from "@/components/ui/skeleton";

const durationLabel = (days: number) => {
  if (days <= 30) return "1 месяц";
  if (days <= 90) return "3 месяца";
  if (days <= 180) return "6 месяцев";
  return "1 год";
};

const Index = () => {
  const { data: tariffs, isLoading } = useTariffs();

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
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
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))
              : tariffs?.map((t) => (
                  <TariffCard
                    key={t.id}
                    name={t.name}
                    duration={durationLabel(t.duration_days)}
                    price={t.price_rub}
                    pricePerMonth={Math.round(t.price_rub / (t.duration_days / 30))}
                    features={t.features}
                    popular={t.priority === 3}
                    onSelect={() => {}}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display text-xs tracking-widest">
            Mozhno<span className="text-primary">VPN</span> © 2025
          </p>
          <p className="mt-2">Безопасность и свобода в интернете</p>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
};

export default Index;
