import { motion } from "framer-motion";
import { Users, Gift, TrendingUp, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const ReferralStats = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "CYBER-X7K9";
  const referrals = 12;
  const bonusDays = 36;
  const conversions = 4;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://vpn.example.com/ref/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="mb-6 font-display text-lg font-bold tracking-wider text-foreground">
        Реферальная программа
      </h3>

      <div className="mb-6 flex items-center gap-3 rounded-lg bg-muted/50 p-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Ваш код</p>
          <p className="font-mono text-lg font-bold text-primary">{referralCode}</p>
        </div>
        <Button variant="cyber-outline" size="icon" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: "Рефералов", value: referrals, color: "text-primary" },
          { icon: Gift, label: "Бонус дней", value: `+${bonusDays}`, color: "neon-text-purple" },
          { icon: TrendingUp, label: "Конверсий", value: conversions, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center rounded-lg bg-muted/30 p-3 text-center"
          >
            <stat.icon className={`mb-1 h-5 w-5 ${stat.color}`} />
            <span className={`font-display text-xl font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Прогресс до награды</span>
          <span>4/5 конверсий</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "80%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Ещё 1 конверсия — и вы получите <span className="text-primary">бесплатный месяц</span>!
        </p>
      </div>
    </div>
  );
};

export default ReferralStats;
