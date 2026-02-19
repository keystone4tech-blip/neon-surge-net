import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Server, Key, AlertTriangle, User, Mail, Phone, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useSubscription } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const ProfileDashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: subscription } = useSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDisplayName(profile?.display_name || "");
    setPhone(profile?.phone || "");
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, phone })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Ошибка сохранения", variant: "destructive", duration: 3000 });
    } else {
      toast({ title: "Профиль обновлён", duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
    }
  };

  const daysLeft = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold tracking-wider text-foreground">
            Информация
          </h3>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={startEditing}>
              <Pencil className="h-4 w-4 mr-1" /> Изменить
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                <X className="h-4 w-4" />
              </Button>
              <Button variant="cyber" size="sm" onClick={saveProfile} disabled={saving}>
                <Check className="h-4 w-4 mr-1" /> {saving ? "..." : "Сохранить"}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground truncate">{user?.email || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Имя</p>
              {editing ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ваше имя"
                  className="h-8 mt-1 bg-muted/50 border-border/50 text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">{profile?.display_name || "Не указано"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Телефон</p>
              {editing ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 999 123-45-67"
                  className="h-8 mt-1 bg-muted/50 border-border/50 text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">{profile?.phone || user?.phone || "Не указан"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Реферальный код</p>
              <p className="text-sm font-mono font-bold text-primary">{profile?.referral_code || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      {subscription && (
        <div className="glass rounded-xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold tracking-wider text-foreground">
              Подписка
            </h3>
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary neon-border-cyan">
              <span className="h-2 w-2 animate-glow-pulse rounded-full bg-primary" />
              {subscription.status === "trial" ? "Пробный период" : "Активна"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, label: "Тариф", value: (subscription as any).tariffs?.name || "—" },
              { icon: Clock, label: "Осталось", value: `${daysLeft} дней` },
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
      )}

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
