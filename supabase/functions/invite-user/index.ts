import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$";
  const all = upper + lower + digits + special;
  let pwd = upper[Math.floor(Math.random() * upper.length)]
    + lower[Math.floor(Math.random() * lower.length)]
    + digits[Math.floor(Math.random() * digits.length)]
    + special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 6; i++) pwd += all[Math.floor(Math.random() * all.length)];
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

const ALLOWED_ROLES = ["super_admin", "admin", "content_editor", "support"] as const;

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  content_editor: "Content Editor",
  support: "Support",
};

async function sendInviteEmail(opts: {
  resendKey: string;
  toEmail: string;
  toName: string;
  role: string;
  password: string;
  loginUrl: string;
}) {
  const { resendKey, toEmail, toName, role, password, loginUrl } = opts;
  const displayRole = ROLE_LABELS[role] ?? "Staff";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid rgba(212,175,55,0.2);overflow:hidden;max-width:580px;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1600,#0A0A0A);padding:36px 40px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.15);">
          <div style="display:inline-flex;align-items:center;gap:12px;margin-bottom:8px;">
            <div style="width:44px;height:44px;background:linear-gradient(135deg,#D4AF37,#F5D76E);border-radius:10px;display:inline-block;line-height:44px;text-align:center;font-weight:900;font-size:14px;color:#0A0A0A;">SV</div>
          </div>
          <div style="color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Solution Villa</div>
          <div style="color:rgba(255,255,255,0.3);font-size:9px;letter-spacing:2px;text-transform:uppercase;">The Digital YES</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.5px;">
            You've been invited
          </h1>
          <p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0 0 28px 0;line-height:1.6;">
            Hi <strong style="color:rgba(255,255,255,0.8);">${toName || toEmail}</strong>, you've been granted <strong style="color:#D4AF37;">${displayRole}</strong> access to the Solution Villa content management system.
          </p>

          <!-- Credentials box -->
          <div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:24px;margin-bottom:28px;">
            <div style="color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Your Login Credentials</div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <span style="color:rgba(255,255,255,0.35);font-size:12px;display:block;margin-bottom:3px;">Email Address</span>
                  <span style="color:#FFFFFF;font-size:15px;font-weight:600;">${toEmail}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="color:rgba(255,255,255,0.35);font-size:12px;display:block;margin-bottom:3px;">Temporary Password</span>
                  <span style="color:#F5D76E;font-size:18px;font-weight:800;font-family:monospace;letter-spacing:2px;">${password}</span>
                </td>
              </tr>
            </table>
          </div>

          <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0 0 24px 0;line-height:1.6;">
            Please change your password immediately after your first login for security.
          </p>

          <!-- CTA Button -->
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#F5D76E);color:#0A0A0A;font-weight:800;font-size:15px;padding:14px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.5px;">
              Login to Dashboard
            </a>
          </div>

          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;line-height:1.6;">
              <strong style="color:rgba(255,255,255,0.5);">Security notice:</strong> This invitation was sent by the Solution Villa Super Admin. If you did not expect this, please ignore this email. Your account will only be activated when you first log in.
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">
            © ${new Date().getFullYear()} Solution Villa · Premium Solutions. Premium Results.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Solution Villa <onboarding@resend.dev>",
      to: [toEmail],
      subject: `You're invited to Solution Villa CMS — ${displayRole} Access`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // ── Verify caller is super_admin ──────────────────────
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { authorization: authHeader } },
    });
    const { data: { user: callerUser } } = await callerClient.auth.getUser();
    if (!callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await callerClient
      .from("user_profiles").select("role").eq("id", callerUser.id).maybeSingle();
    if (profile?.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Only Super Admins can invite users" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse body ────────────────────────────────────────
    const { email, full_name, role = "admin" } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!(ALLOWED_ROLES as readonly string[]).includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role. Must be one of: super_admin, admin, content_editor, support" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Create user ───────────────────────────────────────
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const tempPassword = generatePassword();
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: full_name || email, role },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Upsert user profile ───────────────────────────────
    if (newUser.user) {
      await adminClient.from("user_profiles").upsert({
        id: newUser.user.id,
        full_name: full_name || email,
        role,
      });
    }

    // ── Send invite email ─────────────────────────────────
    const loginUrl = `${supabaseUrl.replace(".supabase.co", "").replace("https://", "https://")}/admin/login`;
    const origin = req.headers.get("origin") || "https://solutionvilla.com";
    const emailSent = { sent: false, error: null as string | null };

    if (resendKey) {
      try {
        await sendInviteEmail({
          resendKey,
          toEmail: email,
          toName: full_name || "",
          role,
          password: tempPassword,
          loginUrl: `${origin}/admin/login`,
        });
        emailSent.sent = true;
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        emailSent.error = String(emailErr);
      }
    }

    // ── Log activity ──────────────────────────────────────
    await adminClient.from("activity_logs").insert({
      user_id: callerUser.id,
      user_email: callerUser.email,
      action: "invited",
      entity_type: "user",
      entity_id: newUser.user?.id,
      entity_title: email,
      details: { role, full_name, email_sent: emailSent.sent },
    }).catch(() => {});

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user?.id,
        email_sent: emailSent.sent,
        // Return temp password so UI can show it if email fails
        temp_password: emailSent.sent ? undefined : tempPassword,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("invite-user error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
