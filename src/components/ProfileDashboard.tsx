import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Server, Key, AlertTriangle, User, Mail, Phone, Pencil, Check, X, MessageCircle, Copy, RefreshCw } from "lucide-react";
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

  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [linkCodeLoading, setLinkCodeLoading] = useState(false);
  const [linkCodeExpires, setLinkCodeExpires] = useState<string | null>(null);

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

  const generateLinkCode = async () => {
    setLinkCodeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `https://kcnpcovrudtvwmnifnqd.supabase.co/functions/v1/generate-link-code`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLinkCode(data.code);
      setLinkCodeExpires(data.expires_at);
      toast({ title: "Код привязки создан", duration: 3000 });
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive", duration: 3000 });
    } finally {
      setLinkCodeLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано", duration: 2000 });
  };

  const daysLeft = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / 86400000))
    : 0;

  const telegramLinked = !!(profile as any)?.telegram_id;
  const referralCode = profile?.referral_code;
  const siteRefLink = referralCode ? `https://neon-surge-net.lovable.app/auth?ref=${referralCode}` : "";
  const botRefLink = referralCode ? `https://t.me/MozhnoVPNBot?start=ref_${referralCode}` : "";

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold tracking-wider text-foreground">Информация</h3>
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
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ваше имя" className="h-8 mt-1 bg-muted/50 border-border/50 text-sm" />
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
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 999 123-45-67" className="h-8 mt-1 bg-muted/50 border-border/50 text-sm" />
              ) : (
                <p className="text-sm font-medium text-foreground">{profile?.phone || user?.phone || "Не указан"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Реферальный код</p>
              <p className="text-sm font-mono font-bold text-primary">{referralCode || "—"}</p>
            </div>
            {referralCode && (
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(referralCode)} className="shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Telegram Link Card */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-bold tracking-wider text-foreground">Telegram</h3>
        </div>

        {telegramLinked ? (
          <div className="rounded-lg bg-primary/10 p-4 text-center">
            <p className="text-sm text-primary font-medium">✅ Telegram привязан</p>
            <p className="text-xs text-muted-foreground mt-1">Вы получаете уведомления в Telegram</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Привяжите Telegram для уведомлений и быстрого доступа
            </p>

            {linkCode ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">Отправьте этот код боту @MozhnoVPNBot:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-mono font-bold text-primary tracking-widest">{linkCode}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`/link ${linkCode}`)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {linkCodeExpires && (
                  <p className="text-xs text-muted-foreground">
                    Действителен 10 минут
                  </p>
                )}
                <div className="flex gap-2 justify-center mt-2">
                  <Button variant="cyber-outline" size="sm" onClick={generateLinkCode} disabled={linkCodeLoading}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Новый код
                  </Button>
                  <Button variant="cyber" size="sm" asChild>
                    <a href="https://t.me/MozhnoVPNBot" target="_blank" rel="noopener noreferrer">
                      Открыть бот
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="cyber" className="w-full" onClick={generateLinkCode} disabled={linkCodeLoading}>
                <MessageCircle className="h-4 w-4 mr-2" />
                {linkCodeLoading ? "Генерация..." : "Привязать Telegram"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Referral Links Card */}
      {referralCode && (
        <div className="glass rounded-xl p-6">
          <h3 className="mb-4 font-display text-lg font-bold tracking-wider text-foreground">
            Реферальные ссылки
          </h3>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">🌐 Ссылка на сайт</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-foreground truncate flex-1">{siteRefLink}</p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(siteRefLink)} className="shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">🤖 Ссылка на бота</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-foreground truncate flex-1">{botRefLink}</p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(botRefLink)} className="shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Card */}
      {subscription && (
        <div className="glass rounded-xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold tracking-wider text-foreground">Подписка</h3>
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
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg bg-muted/30 p-3">
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
        <h3 className="mb-4 font-display text-sm font-bold tracking-wider text-foreground">Быстрые действия</h3>
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
