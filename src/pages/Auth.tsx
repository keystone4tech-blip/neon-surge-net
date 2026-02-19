import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const isPhone = (value: string) => /^\+?\d{7,15}$/.test(value.replace(/[\s()-]/g, ""));

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showNotRegistered, setShowNotRegistered] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const referralCode = searchParams.get("ref");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowNotRegistered(false);

    if (!isLogin && !privacyAccepted) {
      toast({ title: "Необходимо принять политику конфиденциальности", variant: "destructive" });
      return;
    }
    setLoading(true);

    const usePhone = isPhone(identifier);
    const credentials = usePhone
      ? { phone: identifier.replace(/[\s()-]/g, ""), password }
      : { email: identifier, password };

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) {
          if (error.message === "Invalid login credentials") {
            setShowNotRegistered(true);
            return;
          }
          throw error;
        }
        toast({ title: "Добро пожаловать!", duration: 3000 });
        navigate("/profile");
      } else {
        const signUpData = usePhone
          ? { phone: credentials.phone!, password }
          : { email: credentials.email!, password, options: { emailRedirectTo: window.location.origin } };
        const { data, error } = await supabase.auth.signUp(signUpData as any);
        if (error) throw error;

        if (referralCode) {
          localStorage.setItem("pending_referral", referralCode);
        }

        if (data.user) {
          toast({ title: "Аккаунт создан! Добро пожаловать!", duration: 3000 });
          navigate("/profile");
        }
      }
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive", duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid pb-16 md:pb-0">
      <Navbar />
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 neon-border-cyan">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-wider text-foreground">
                {isLogin ? "Вход" : "Регистрация"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLogin ? "Войдите в аккаунт MozhnoVPN" : "Создайте аккаунт и получите 7 дней бесплатно"}
              </p>
            </div>

            {showNotRegistered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center"
              >
                <p className="text-sm text-foreground mb-2">
                  Аккаунт не найден. Возможно, вы ещё не зарегистрированы.
                </p>
                <Button
                  variant="cyber"
                  size="sm"
                  onClick={() => { setIsLogin(false); setShowNotRegistered(false); }}
                >
                  Зарегистрироваться
                </Button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-muted-foreground">Email или телефон</Label>
                <Input
                  id="identifier"
                  type="text"
                  required
                  placeholder="you@example.com или +79991234567"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Минимум 6 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/50 border-border/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(v) => setPrivacyAccepted(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="privacy" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                    Я принимаю{" "}
                    <Link to="/privacy" className="text-primary underline hover:text-primary/80">
                      политику конфиденциальности
                    </Link>{" "}
                    и даю согласие на обработку персональных данных
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                variant="cyber"
                size="lg"
                className={`w-full ${!isLogin ? "animated-gradient-btn" : ""}`}
                disabled={loading || (!isLogin && !privacyAccepted)}
              >
                {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setShowNotRegistered(false); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
              </button>
            </div>

            {referralCode && !isLogin && (
              <div className="mt-4 rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-xs text-primary">
                  Реферальный код: <span className="font-mono font-bold">{referralCode}</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Auth;
