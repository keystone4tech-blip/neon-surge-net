import { motion } from "framer-motion";
import { Shield, Clock, Server, Key, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfileDashboard = () => {
  const subscription = {
    active: true,
    plan: "6 месяцев",
    expiresAt: "2025-09-15",
    daysLeft: 87,
    server: "Frankfurt DE-1",
    dataUsed: "142.3 GB",
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold tracking-wider text-foreground">
            Подписка
          </h3>
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary neon-border-cyan">
            <span className="h-2 w-2 animate-glow-pulse rounded-full bg-primary" />
            Активна
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Shield, label: "Тариф", value: subscription.plan },
            { icon: Clock, label: "Осталось", value: `${subscription.daysLeft} дней` },
            { icon: Server, label: "Сервер", value: subscription.server },
            { icon: Key, label: "Трафик", value: subscription.dataUsed },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg bg-muted/30 p-3"
            >
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-3.5 w-3.5" />
                <span className="text-xs">{item.label}</span>
              </div>
              <p className="font-mono text-sm font-semibold text-foreground">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-xl p-6">
        <h3 className="mb-4 font-display text-sm font-bold tracking-wider text-foreground">
          Быстрые действия
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="cyber-outline" className="h-auto flex-col gap-1 py-4">
            <Key className="h-5 w-5" />
            <span className="text-xs">Скачать ключ</span>
          </Button>
          <Button variant="cyber-outline" className="h-auto flex-col gap-1 py-4">
            <Server className="h-5 w-5" />
            <span className="text-xs">Сменить сервер</span>
          </Button>
          <Button variant="cyber-outline" className="h-auto flex-col gap-1 py-4">
            <Clock className="h-5 w-5" />
            <span className="text-xs">Продлить</span>
          </Button>
          <Button variant="cyber-outline" className="h-auto flex-col gap-1 py-4">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs">Поддержка</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
