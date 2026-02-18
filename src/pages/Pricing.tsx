import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
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

const Pricing = () => {
  const { data: tariffs, isLoading } = useTariffs();

  return (
    <div className="min-h-screen bg-background cyber-grid pb-16 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-4xl font-bold tracking-wider text-foreground md:text-5xl">
            Тарифы
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Начни с 7-дневного бесплатного триала
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      <BottomNav />
    </div>
  );
};

export default Pricing;
