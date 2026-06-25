const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { campaignId } = await req.json();
    if (!campaignId) return new Response(JSON.stringify({ error: "campaignId required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_KEY) return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });

    // Import Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle();

    if (campErr || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), { status: 404, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    if (campaign.status === "sent") {
      return new Response(JSON.stringify({ error: "Campaign already sent" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Fetch active subscribers
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("status", "active");

    const list = subscribers ?? [];
    if (list.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No active subscribers" }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Send via Resend (batch — one call per subscriber)
    let sent = 0;
    for (const sub of list) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Solution Villa <newsletter@solutionvilla.com>",
          to: [sub.email],
          subject: campaign.subject,
          html: campaign.body,
        }),
      });
      if (res.ok) sent++;
      else {
        const err = await res.text();
        console.error(`Failed to send to ${sub.email}:`, err);
      }
    }

    // Update campaign
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: sent })
      .eq("id", campaignId);

    return new Response(JSON.stringify({ sent }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
