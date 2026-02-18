import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
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

const Pricing = () => {
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
          {tariffs.map((t, i) => (
            <TariffCard key={i} {...t} onSelect={() => {}} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Pricing;
