import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tariff {
  id: string;
  name: string;
  duration_days: number;
  price_rub: number;
  is_active: boolean;
  priority: number;
  description: string | null;
  max_devices: number;
  features: string[];
}

export const useTariffs = () => {
  return useQuery({
    queryKey: ["tariffs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tariffs")
        .select("*")
        .eq("is_active", true)
        .order("priority");
      if (error) throw error;
      return (data ?? []).map((t: any) => ({
        ...t,
        features: Array.isArray(t.features) ? t.features : JSON.parse(t.features || "[]"),
      })) as Tariff[];
    },
  });
};
