import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Key, AlertTriangle, User, Mail, Phone, Pencil, Check, X, MessageCircle, Copy, RefreshCw, Lock, AtSign } from "lucide-react";
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

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleChangePassword = async () => {
    if (!newPassword && !newEmail) {
      toast({ title: "Укажите новый пароль или email", variant: "destructive", duration: 3000 });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: "Пароли не совпадают", variant: "destructive", duration: 3000 });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast({ title: "Пароль минимум 6 символов", variant: "destructive", duration: 3000 });
      return;
    }

    setChangingPassword(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `https://kcnpcovrudtvwmnifnqd.supabase.co/functions/v1/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword || undefined,
            new_email: newEmail || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Данные обновлены", duration: 3000 });
      setShowPasswordChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNewEmail("");
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive", duration: 3000 });
    } finally {
      setChangingPassword(false);
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

  const p = profile as any;
  const telegramLinked = !!p?.telegram_id;
  const referralCode = profile?.referral_code;
  const siteRefLink = referralCode ? `https://neon-surge-net.lovable.app/auth?ref=${referralCode}` : "";
  const botRefLink = referralCode ? `https://t.me/MozhnoVPN_bot?start=ref_${referralCode}` : "";

  return (
    <div className="space-y-4">
      {/* User Info Card */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base sm:text-lg font-bold tracking-wider text-foreground">Информация</h3>
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

        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
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
              <p className="text-sm font-mono font-bold text-primary break-all">{referralCode || "—"}</p>
            </div>
            {referralCode && (
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(referralCode)} className="shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Change Email/Password Card */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-display text-base sm:text-lg font-bold tracking-wider text-foreground">Безопасность</h3>
          </div>
          {!showPasswordChange && (
            <Button variant="ghost" size="sm" onClick={() => setShowPasswordChange(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Изменить
            </Button>
          )}
        </div>

        {showPasswordChange ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Текущий пароль *</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-muted/50 border-border/50 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Новый email (необязательно)</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={user?.email} className="bg-muted/50 border-border/50 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Новый пароль</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Минимум 6 символов" className="bg-muted/50 border-border/50 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Подтверждение пароля</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-muted/50 border-border/50 text-sm" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => { setShowPasswordChange(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setNewEmail(""); }} disabled={changingPassword}>
                Отмена
              </Button>
              <Button variant="cyber" size="sm" onClick={handleChangePassword} disabled={changingPassword || !currentPassword}>
                {changingPassword ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Изменить email и пароль от личного кабинета</p>
        )}
      </div>

      {/* Telegram Link Card */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-display text-base sm:text-lg font-bold tracking-wider text-foreground">Telegram</h3>
        </div>

        {telegramLinked ? (
          <div className="space-y-2">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-primary font-medium">✅ Telegram привязан</p>
            </div>
            <div className="space-y-2">
              {p.telegram_first_name && (
                <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Имя в Telegram</p>
                    <p className="text-sm font-medium text-foreground">{[p.telegram_first_name, p.telegram_last_name].filter(Boolean).join(" ")}</p>
                  </div>
                </div>
              )}
              {p.telegram_username && (
                <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                  <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="text-sm font-medium text-primary">@{p.telegram_username}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Привяжите Telegram для уведомлений и быстрого доступа
            </p>

            {linkCode ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">Отправьте этот код боту @MozhnoVPN_bot:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-sm sm:text-lg font-mono font-bold text-primary tracking-wider break-all max-w-[200px] sm:max-w-none">{linkCode}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`/link ${linkCode}`)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {linkCodeExpires && (
                  <p className="text-xs text-muted-foreground">Действителен 10 минут</p>
                )}
                <div className="flex gap-2 justify-center mt-2 flex-wrap">
                  <Button variant="cyber-outline" size="sm" onClick={generateLinkCode} disabled={linkCodeLoading}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Новый код
                  </Button>
                  <Button variant="cyber" size="sm" asChild>
                    <a href="https://t.me/MozhnoVPN_bot" target="_blank" rel="noopener noreferrer">
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
        <div className="glass rounded-xl p-4 sm:p-6">
          <h3 className="mb-3 font-display text-base sm:text-lg font-bold tracking-wider text-foreground">
            Реферальные ссылки
          </h3>
          <div className="space-y-2">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">🌐 Ссылка на сайт</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-foreground truncate flex-1 break-all">{siteRefLink}</p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(siteRefLink)} className="shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">🤖 Ссылка на бота</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-foreground truncate flex-1 break-all">{botRefLink}</p>
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
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-display text-base sm:text-lg font-bold tracking-wider text-foreground">Подписка</h3>
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary neon-border-cyan">
              <span className="h-2 w-2 animate-glow-pulse rounded-full bg-primary" />
              {subscription.status === "trial" ? "Пробный период" : "Активна"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="mb-3 font-display text-sm font-bold tracking-wider text-foreground">Быстрые действия</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="cyber-outline" className="h-auto flex-col gap-1 py-3">
            <Key className="h-5 w-5" />
            <span className="text-xs">Скачать ключ</span>
          </Button>
          <Button variant="cyber-outline" className="h-auto flex-col gap-1 py-3">
            <Clock className="h-5 w-5" />
            <span className="text-xs">Продлить</span>
          </Button>
          <Button variant="cyber-outline" className="h-auto flex-col gap-1 py-3 col-span-2" asChild>
            <a href="https://t.me/MozhnoVPN_bot" target="_blank" rel="noopener noreferrer">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs">Поддержка</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
