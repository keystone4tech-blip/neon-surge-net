import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TariffCardProps {
  name: string;
  duration: string;
  price: number;
  pricePerMonth: number;
  features: string[];
  popular?: boolean;
  savings?: string;
  onSelect: () => void;
}

const TariffCard = ({
  name,
  duration,
  price,
  pricePerMonth,
  features,
  popular = false,
  savings,
  onSelect,
}: TariffCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative flex flex-col rounded-xl p-[1px] transition-all duration-500",
        popular
          ? "bg-gradient-to-b from-primary via-secondary to-primary"
          : "bg-gradient-to-b from-border/60 to-border/20"
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-display font-bold tracking-widest text-primary-foreground uppercase">
            <Zap className="h-3 w-3" /> Популярный
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col rounded-[11px] p-6 lg:p-8",
          popular ? "glass-strong" : "glass"
        )}
      >
        <div className="mb-6">
          <h3 className="font-display text-lg font-bold tracking-wider text-foreground">
            {name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{duration}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "font-display text-4xl font-black",
              popular ? "neon-text-cyan" : "text-foreground"
            )}>
              {price}₽
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ~{pricePerMonth}₽/мес
          </p>
          {savings && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary neon-border-cyan"
            >
              Экономия {savings}
            </motion.span>
          )}
        </div>

        <ul className="mb-8 flex-1 space-y-3">
          {features.map((feature, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {feature}
            </motion.li>
          ))}
        </ul>

        <Button
          variant={popular ? "cyber" : "cyber-outline"}
          size="lg"
          onClick={onSelect}
          className="glitch-hover w-full"
        >
          Подключить
        </Button>
      </div>
    </motion.div>
  );
};

export default TariffCard;
