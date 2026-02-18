import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users, CreditCard, Settings, BarChart3, MessageSquare, Server,
  Search, Ban, CheckCircle, Download, Plus
} from "lucide-react";

const tabs = [
  { id: "users", label: "Пользователи", icon: Users },
  { id: "payments", label: "Платежи", icon: CreditCard },
  { id: "tariffs", label: "Тарифы", icon: Settings },
  { id: "referrals", label: "Рефералы", icon: BarChart3 },
  { id: "tickets", label: "Поддержка", icon: MessageSquare },
  { id: "servers", label: "Серверы", icon: Server },
];

const mockUsers = [
  { id: 1, name: "Алексей К.", email: "alex@mail.ru", plan: "6 мес", status: "active", expires: "2025-09-15" },
  { id: 2, name: "Мария П.", email: "maria@gmail.com", plan: "1 мес", status: "active", expires: "2025-04-01" },
  { id: 3, name: "Дмитрий С.", email: "dmitry@ya.ru", plan: "Триал", status: "trial", expires: "2025-03-10" },
  { id: 4, name: "Ольга В.", email: "olga@mail.ru", plan: "—", status: "banned", expires: "—" },
];

const mockPayments = [
  { id: 1, user: "Алексей К.", amount: "700₽", method: "YooKassa", status: "confirmed", date: "2025-03-01" },
  { id: 2, user: "Мария П.", amount: "150₽", method: "Ручная", status: "pending", date: "2025-03-03" },
  { id: 3, user: "Игорь Н.", amount: "1200₽", method: "CryptoBot", status: "confirmed", date: "2025-03-02" },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");

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
            { label: "Пользователей", value: "1,247" },
            { label: "Активных", value: "892" },
            { label: "Доход (мес)", value: "134,500₽" },
            { label: "Серверов", value: "12" },
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
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                <Button variant="cyber-outline" size="sm">
                  <Download className="h-4 w-4" /> Экспорт
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                      <th className="p-4">Пользователь</th>
                      <th className="p-4">Тариф</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4">Истекает</th>
                      <th className="p-4">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="p-4 font-mono text-foreground">{u.plan}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.status === "active" ? "bg-primary/10 text-primary" :
                            u.status === "trial" ? "bg-secondary/10 text-secondary" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {u.status === "active" ? "Активен" : u.status === "trial" ? "Триал" : "Забанен"}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">{u.expires}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              {u.status === "banned" ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <div className="flex items-center justify-between border-b border-border/50 p-4">
                <h3 className="font-display text-sm font-bold tracking-wider text-foreground">Транзакции</h3>
                <Button variant="cyber-outline" size="sm">
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                      <th className="p-4">Пользователь</th>
                      <th className="p-4">Сумма</th>
                      <th className="p-4">Метод</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayments.map((p) => (
                      <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="p-4 text-foreground">{p.user}</td>
                        <td className="p-4 font-mono font-bold text-foreground">{p.amount}</td>
                        <td className="p-4 text-muted-foreground">{p.method}</td>
                        <td className="p-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.status === "confirmed" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                          }`}>
                            {p.status === "confirmed" ? "Подтверждён" : "Ожидает"}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tariffs" && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold tracking-wider text-foreground">Управление тарифами</h3>
                <Button variant="cyber" size="sm"><Plus className="h-4 w-4" /> Добавить</Button>
              </div>
              <div className="space-y-3">
                {[
                  { name: "1 месяц", price: "150₽", active: true },
                  { name: "3 месяца", price: "400₽", active: true },
                  { name: "6 месяцев", price: "700₽", active: true },
                  { name: "1 год", price: "1200₽", active: true },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                    <div>
                      <p className="font-medium text-foreground">{t.name}</p>
                      <p className="font-mono text-sm text-primary">{t.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary">Активен</span>
                      <Button variant="ghost" size="sm">Изменить</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!["users", "payments", "tariffs"].includes(activeTab) && (
            <div className="flex min-h-[200px] items-center justify-center p-8">
              <p className="text-muted-foreground">
                Раздел «{tabs.find(t => t.id === activeTab)?.label}» — в разработке
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
