import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendMessage(chatId: number, text: string, opts: Record<string, unknown> = {}) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...opts }),
  });
}

function saveTelegramInfo(userId: string, from: any) {
  return supabase.from("profiles").update({
    telegram_id: from.id,
    telegram_username: from.username || null,
    telegram_first_name: from.first_name || null,
    telegram_last_name: from.last_name || null,
  }).eq("user_id", userId);
}

async function handleStart(chatId: number, telegramId: number, startPayload: string) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id, display_name, referral_code")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existing) {
    await sendMessage(chatId, `👋 С возвращением! Ваш аккаунт уже привязан.\n\nВаш реферальный код: <code>${existing.referral_code}</code>`);
    return;
  }

  if (startPayload?.startsWith("ref_")) {
    await sendMessage(chatId,
      `🎉 Вы перешли по реферальной ссылке!\n\nЧтобы зарегистрироваться через бот, отправьте:\n/register email@example.com ваш_пароль\n\nИли привяжите аккаунт сайта:\n/link ВАШ_КОД`,
    );
    return;
  }

  await sendMessage(chatId,
    `👋 Добро пожаловать в MozhnoVPN!\n\n` +
    `<b>Привязать аккаунт сайта:</b>\n/link ВАШ_КОД\n(Код получите в личном кабинете)\n\n` +
    `<b>Зарегистрироваться:</b>\n/register email@example.com ваш_пароль\n\n` +
    `<b>Помощь:</b> /help`,
  );
}

async function handleLink(chatId: number, telegramId: number, code: string, from: any) {
  if (!code) {
    await sendMessage(chatId, "❌ Укажите код: /link ВАШ_КОД");
    return;
  }

  const { data: linkCode } = await supabase
    .from("telegram_link_codes")
    .select("*")
    .eq("code", code.trim())
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!linkCode) {
    await sendMessage(chatId, "❌ Код недействителен или истёк. Получите новый в личном кабинете.");
    return;
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existingProfile) {
    await sendMessage(chatId, "⚠️ Этот Telegram уже привязан к другому профилю.");
    return;
  }

  // Save telegram info including username, first/last name
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      telegram_id: telegramId,
      telegram_username: from.username || null,
      telegram_first_name: from.first_name || null,
      telegram_last_name: from.last_name || null,
    })
    .eq("user_id", linkCode.user_id);

  if (updateError) {
    await sendMessage(chatId, "❌ Ошибка привязки. Попробуйте позже.");
    return;
  }

  await supabase.from("telegram_link_codes").update({ used: true }).eq("id", linkCode.id);
  await sendMessage(chatId, "✅ Аккаунт успешно привязан!");
}

async function handleRegister(chatId: number, telegramId: number, args: string, from: any, startPayload?: string) {
  const parts = args.trim().split(/\s+/);
  if (parts.length < 2) {
    await sendMessage(chatId, "❌ Формат: /register email@example.com ваш_пароль\nИли: /register +79991234567 ваш_пароль");
    return;
  }

  const [identifier, password] = parts;
  const isPhoneInput = /^\+?\d{7,15}$/.test(identifier.replace(/[\s()-]/g, ""));

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existingProfile) {
    await sendMessage(chatId, "⚠️ Этот Telegram уже привязан к аккаунту.");
    return;
  }

  const signUpData = isPhoneInput
    ? { phone: identifier.replace(/[\s()-]/g, ""), password }
    : { email: identifier, password };

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    ...signUpData,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { display_name: from.first_name || "User" },
  });

  if (authError) {
    if (authError.message.includes("already")) {
      await sendMessage(chatId, "⚠️ Этот email/телефон уже зарегистрирован. Используйте /link КОД.");
    } else {
      await sendMessage(chatId, `❌ Ошибка: ${authError.message}`);
    }
    return;
  }

  if (authData.user) {
    // Save telegram user info
    await saveTelegramInfo(authData.user.id, from);

    // Handle referral if present
    if (startPayload?.startsWith("ref_")) {
      const refCode = startPayload.replace("ref_", "");
      const { data: inviter } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("referral_code", refCode)
        .maybeSingle();
      if (inviter) {
        await supabase.from("referral_events").insert({
          inviter_id: inviter.user_id,
          invitee_id: authData.user.id,
          event_type: "signup",
          bonus_days: 3,
        });
        await supabase.from("profiles").update({ referred_by: inviter.user_id }).eq("user_id", authData.user.id);
      }
    }

    const { data: profile } = await supabase.from("profiles").select("referral_code").eq("user_id", authData.user.id).single();

    await sendMessage(chatId,
      `✅ Регистрация успешна!\n\n` +
      `Войдите на сайт: ${identifier}\n\n` +
      `Реферальный код: <code>${profile?.referral_code || "—"}</code>`,
    );
  }
}

async function handleStatus(chatId: number, telegramId: number) {
  const { data: profile } = await supabase.from("profiles").select("user_id").eq("telegram_id", telegramId).maybeSingle();
  if (!profile) { await sendMessage(chatId, "❌ Аккаунт не привязан. /link или /register"); return; }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*, tariffs(name)")
    .eq("user_id", profile.user_id)
    .in("status", ["active", "trial"])
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) { await sendMessage(chatId, "📭 Нет активной подписки."); return; }

  const daysLeft = Math.max(0, Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / 86400000));
  await sendMessage(chatId,
    `📊 <b>Подписка:</b>\nТариф: ${(sub as any).tariffs?.name || "—"}\nСтатус: ${sub.status === "trial" ? "Пробный" : "Активна"}\nОсталось: ${daysLeft} дней`,
  );
}

async function handleReferral(chatId: number, telegramId: number) {
  const { data: profile } = await supabase.from("profiles").select("referral_code").eq("telegram_id", telegramId).maybeSingle();
  if (!profile) { await sendMessage(chatId, "❌ Аккаунт не привязан."); return; }

  const siteUrl = `https://neon-surge-net.lovable.app/auth?ref=${profile.referral_code}`;
  const botUrl = `https://t.me/MozhnoVPN_bot?start=ref_${profile.referral_code}`;
  await sendMessage(chatId, `🔗 <b>Реферальные ссылки:</b>\n\n🌐 ${siteUrl}\n🤖 ${botUrl}\n\n+3 дня за каждого друга!`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Setup webhook endpoint
  if (url.searchParams.get("setup") === "true") {
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const update = await req.json();
    const message = update.message;
    if (!message?.text) return new Response("ok");

    const chatId = message.chat.id;
    const telegramId = message.from.id;
    const text = message.text.trim();
    const from = message.from;

    if (text.startsWith("/start")) {
      const payload = text.replace("/start", "").trim();
      await handleStart(chatId, telegramId, payload);
    } else if (text.startsWith("/link")) {
      await handleLink(chatId, telegramId, text.replace("/link", "").trim(), from);
    } else if (text.startsWith("/register")) {
      await handleRegister(chatId, telegramId, text.replace("/register", "").trim(), from);
    } else if (text === "/help") {
      await sendMessage(chatId,
        `<b>MozhnoVPN Bot:</b>\n/start — Начать\n/link КОД — Привязать аккаунт\n/register email пароль — Регистрация\n/status — Подписка\n/referral — Реф. ссылки\n/help — Помощь`);
    } else if (text === "/status") {
      await handleStatus(chatId, telegramId);
    } else if (text === "/referral") {
      await handleReferral(chatId, telegramId);
    } else {
      await sendMessage(chatId, "Неизвестная команда. /help");
    }

    return new Response("ok");
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("error", { status: 500 });
  }
});
