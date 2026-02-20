import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsError } = await supabaseUser.auth.getClaims(token);
  if (claimsError || !claims?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claims.claims.sub;

  // Generate 6-char alphanumeric code
  const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(36).toUpperCase())
    .join("")
    .slice(0, 6);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Invalidate old codes
  await supabaseAdmin
    .from("telegram_link_codes")
    .update({ used: true })
    .eq("user_id", userId)
    .eq("used", false);

  // Create new code
  const { data, error } = await supabaseAdmin
    .from("telegram_link_codes")
    .insert({
      user_id: userId,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ code: data.code, expires_at: data.expires_at }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
