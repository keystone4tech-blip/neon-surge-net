import { motion } from "framer-motion";
import { Shield, Globe, Zap, Eye, Lock, Wifi } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "WireGuard",
    desc: "Современный протокол с минимальной задержкой и максимальной скоростью",
  },
  {
    icon: Globe,
    title: "10+ локаций",
    desc: "Серверы в Европе, США, Азии — выбирайте ближайший",
  },
  {
    icon: Zap,
    title: "Без лимитов",
    desc: "Безлимитный трафик на всех тарифах без ограничений скорости",
  },
  {
    icon: Eye,
    title: "No-logs",
    desc: "Мы не храним логи вашего трафика. Полная приватность",
  },
  {
    icon: Lock,
    title: "Шифрование",
    desc: "AES-256 шифрование для защиты всех ваших данных",
  },
  {
    icon: Wifi,
    title: "Все устройства",
    desc: "Windows, macOS, Android, iOS, Linux — один ключ на все",
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold tracking-wider text-foreground md:text-4xl">
            Почему <span className="neon-text-cyan">мы</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Скорость, безопасность и конфиденциальность без компромиссов
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="glass group rounded-xl p-6 transition-all duration-300 hover:neon-border-cyan"
            >
              <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-display text-sm font-bold tracking-wider text-foreground">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
