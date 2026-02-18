import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

export const useSubscription = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, tariffs(*)")
        .eq("user_id", user!.id)
        .in("status", ["active", "trial"])
        .order("end_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useReferralStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["referral_stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("referral_events")
        .select("*")
        .eq("inviter_id", user!.id);
      if (error) throw error;

      const totalReferrals = events?.length ?? 0;
      const bonusDays = events?.reduce((sum, e) => sum + (e.bonus_days || 0), 0) ?? 0;
      const conversions = events?.filter((e) => e.event_type === "first_purchase").length ?? 0;

      return { totalReferrals, bonusDays, conversions, events: events ?? [] };
    },
  });
};
