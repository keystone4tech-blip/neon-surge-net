import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, CreditCard, Settings, BarChart3, MessageSquare, Server,
  Search, Ban, CheckCircle, Download, Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { id: "users", label: "Пользователи", icon: Users },
  { id: "payments", label: "Платежи", icon: CreditCard },
  { id: "tariffs", label: "Тарифы", icon: Settings },
  { id: "referrals", label: "Рефералы", icon: BarChart3 },
  { id: "tickets", label: "Поддержка", icon: MessageSquare },
  { id: "servers", label: "Серверы", icon: Server },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["admin_users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, subscriptions(status, end_date, tariffs(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["admin_payments"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, profiles!payments_user_id_fkey(display_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: tariffs } = useQuery({
    queryKey: ["admin_tariffs"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tariffs")
        .select("*")
        .order("priority");
      if (error) throw error;
      return data;
    },
  });

  const { data: tickets } = useQuery({
    queryKey: ["admin_tickets"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, profiles!tickets_user_id_fkey(display_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: servers } = useQuery({
    queryKey: ["admin_servers"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const confirmPayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("payments")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_payments"] });
      toast({ title: "Платёж подтверждён" });
    },
  });

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const filteredUsers = users?.filter(
    (u) =>
      !searchQuery ||
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 font-display text-3xl font-bold tracking-wider text-foreground"
        >
          Админ-панель
        </motion.h1>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Пользователей", value: users?.length ?? 0 },
            { label: "Платежей", value: payments?.length ?? 0 },
            { label: "Тарифов", value: tariffs?.length ?? 0 },
            { label: "Серверов", value: servers?.length ?? 0 },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-bold neon-text-cyan">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Button
              key={t.id}
              variant={activeTab === t.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(t.id)}
              className="gap-1.5"
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl"
        >
          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between border-b border-border/50 p-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Поиск пользователей..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                      <th className="p-4">Пользователь</th>
                      <th className="p-4">Тариф</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers?.map((u) => {
                      const sub = (u as any).subscriptions?.[0];
                      return (
                        <tr key={u.id} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="p-4">
                            <p className="font-medium text-foreground">{u.display_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{u.referral_code}</p>
                          </td>
                          <td className="p-4 font-mono text-foreground">
                            {sub?.tariffs?.name ?? "Нет"}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              sub?.status === "active" ? "bg-primary/10 text-primary" :
                              sub?.status === "trial" ? "bg-secondary/10 text-secondary" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {sub?.status === "active" ? "Активен" : sub?.status === "trial" ? "Триал" : "Нет подписки"}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString("ru-RU")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <div className="flex items-center justify-between border-b border-border/50 p-4">
                <h3 className="font-display text-sm font-bold tracking-wider text-foreground">Транзакции</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                      <th className="p-4">Пользователь</th>
                      <th className="p-4">Сумма</th>
                      <th className="p-4">Метод</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments?.map((p: any) => (
                      <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="p-4 text-foreground">{p.profiles?.display_name ?? "—"}</td>
                        <td className="p-4 font-mono font-bold text-foreground">{p.amount}₽</td>
                        <td className="p-4 text-muted-foreground">{p.method}</td>
                        <td className="p-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.status === "confirmed" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                          }`}>
                            {p.status === "confirmed" ? "Подтверждён" : "Ожидает"}
                          </span>
                        </td>
                        <td className="p-4">
                          {p.status === "pending" && (
                            <Button
                              variant="cyber-outline"
                              size="sm"
                              onClick={() => confirmPayment.mutate(p.id)}
                            >
                              <CheckCircle className="h-4 w-4" /> Подтвердить
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!payments || payments.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Нет транзакций
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tariffs" && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold tracking-wider text-foreground">Управление тарифами</h3>
              </div>
              <div className="space-y-3">
                {tariffs?.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                    <div>
                      <p className="font-medium text-foreground">{t.name}</p>
                      <p className="font-mono text-sm text-primary">{t.price_rub}₽ · {t.duration_days} дн.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${t.is_active ? "text-primary" : "text-muted-foreground"}`}>
                        {t.is_active ? "Активен" : "Архив"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div>
              <div className="border-b border-border/50 p-4">
                <h3 className="font-display text-sm font-bold tracking-wider text-foreground">Тикеты поддержки</h3>
              </div>
              <div className="divide-y divide-border/30">
                {tickets?.map((t: any) => (
                  <div key={t.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{t.subject}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.status === "open" ? "bg-secondary/10 text-secondary" :
                        t.status === "resolved" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.profiles?.display_name} · {new Date(t.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                ))}
                {(!tickets || tickets.length === 0) && (
                  <p className="p-8 text-center text-muted-foreground">Нет тикетов</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "servers" && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold tracking-wider text-foreground">VPN Серверы</h3>
              </div>
              <div className="space-y-3">
                {servers?.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                    <div>
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.location} · {s.ip_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-primary">{s.load_percent}%</p>
                      <p className="text-xs text-muted-foreground">{s.current_users}/{s.max_users}</p>
                    </div>
                  </div>
                ))}
                {(!servers || servers.length === 0) && (
                  <p className="text-center text-muted-foreground">Нет серверов</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "referrals" && (
            <div className="flex min-h-[200px] items-center justify-center p-8">
              <p className="text-muted-foreground">
                Раздел «Рефералы» — в разработке
              </p>
            </div>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Admin;
