import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

    try {
      if (isLogin) {
        const credentials = authMethod === "email"
          ? { email, password }
          : { phone, password };
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) {
          if (error.message === "Invalid login credentials") {
            setShowNotRegistered(true);
            return;
          }
          throw error;
        }
        toast({ title: "Добро пожаловать!" });
        navigate("/profile");
      } else {
        const signUpData = authMethod === "email"
          ? { email, password, options: { emailRedirectTo: window.location.origin } }
          : { phone, password };
        const { data, error } = await supabase.auth.signUp(signUpData);
        if (error) throw error;

        if (referralCode) {
          localStorage.setItem("pending_referral", referralCode);
        }

        if (data.user) {
          toast({ title: "Аккаунт создан! Добро пожаловать!" });
          navigate("/profile");
        }
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
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

            {/* Not registered alert */}
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

            {/* Auth method toggle */}
            <div className="mb-4 flex rounded-lg bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors ${
                  authMethod === "email" ? "bg-primary/20 text-primary" : "text-muted-foreground"
                }`}
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors ${
                  authMethod === "phone" ? "bg-primary/20 text-primary" : "text-muted-foreground"
                }`}
              >
                <Phone className="h-3.5 w-3.5" /> Телефон
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMethod === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-muted/50 border-border/50 pl-10"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-muted-foreground">Номер телефона</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+7 (999) 123-45-67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-muted/50 border-border/50 pl-10"
                    />
                  </div>
                </div>
              )}

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

              {/* Privacy checkbox for registration */}
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
