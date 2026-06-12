import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const BOOTSTRAP_SECRET = "sv-bootstrap-2026-once";

const ADMINS = [
  { email: "oluwapelumisolomon0656@gmail.com", full_name: "Oluwapelumi Solomon", role: "admin" },
  { email: "delightdesign.org@gmail.com", full_name: "Delight Design", role: "admin" },
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bootstrap-secret",
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

async function sendEmail(resendKey: string, email: string, name: string, password: string, loginUrl: string) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid rgba(212,175,55,0.2);overflow:hidden;max-width:580px;">
        <tr><td style="background:linear-gradient(135deg,#1a1600,#0A0A0A);padding:36px 40px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.15);">
          <div style="display:inline-flex;align-items:center;gap:12px;margin-bottom:8px;">
            <div style="width:44px;height:44px;background:linear-gradient(135deg,#D4AF37,#F5D76E);border-radius:10px;display:inline-block;line-height:44px;text-align:center;font-weight:900;font-size:14px;color:#0A0A0A;">SV</div>
          </div>
          <div style="color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Solution Villa</div>
          <div style="color:rgba(255,255,255,0.3);font-size:9px;letter-spacing:2px;text-transform:uppercase;">The Digital YES</div>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.5px;">
            Welcome to Solution Villa CMS
          </h1>
          <p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0 0 28px 0;line-height:1.6;">
            Hi <strong style="color:rgba(255,255,255,0.8);">${name}</strong>, you have been granted <strong style="color:#D4AF37;">Admin</strong> access to the Solution Villa content management system.
          </p>
          <div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:24px;margin-bottom:28px;">
            <div style="color:#D4AF37;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Your Login Credentials</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:rgba(255,255,255,0.35);font-size:12px;display:block;margin-bottom:3px;">Email Address</span>
                <span style="color:#FFFFFF;font-size:15px;font-weight:600;">${email}</span>
              </td></tr>
              <tr><td style="padding:8px 0;">
                <span style="color:rgba(255,255,255,0.35);font-size:12px;display:block;margin-bottom:3px;">Temporary Password</span>
                <span style="color:#F5D76E;font-size:20px;font-weight:800;font-family:monospace;letter-spacing:3px;">${password}</span>
              </td></tr>
            </table>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0 0 24px 0;line-height:1.6;">
            Please change your password immediately after your first login for security.
          </p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#F5D76E);color:#0A0A0A;font-weight:800;font-size:15px;padding:16px 40px;border-radius:50px;text-decoration:none;letter-spacing:0.5px;">
              Access Admin Dashboard
            </a>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;line-height:1.6;">
              Dashboard URL: <a href="${loginUrl}" style="color:#D4AF37;">${loginUrl}</a><br>
              If you have any issues accessing the system, contact the system administrator.
            </p>
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">© 2026 Solution Villa · Premium Solutions. Premium Results.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Solution Villa <onboarding@resend.dev>",
      to: [email],
      subject: "You have been granted Admin access to Solution Villa CMS",
      html,
    }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const secret = req.headers.get("x-bootstrap-secret");
  if (secret !== BOOTSTRAP_SECRET) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const loginUrl = "https://spb-t4nxv154wkw82b31.supabase.opentrust.net".replace("supabase.opentrust.net", "enter.pro") + "/admin/login";
  const adminLoginUrl = "https://solutionvilla.digitalyes.online/admin/login";

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results = [];

  for (const admin of ADMINS) {
    const tempPassword = generatePassword();
    console.log(`Creating user: ${admin.email} with password: ${tempPassword}`);

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: admin.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: admin.full_name, role: admin.role },
    });

    if (createError) {
      console.error(`Error creating ${admin.email}:`, createError.message);
      results.push({ email: admin.email, success: false, error: createError.message, password: tempPassword });
      continue;
    }

    if (newUser.user) {
      await adminClient.from("user_profiles").upsert({
        id: newUser.user.id,
        full_name: admin.full_name,
        role: admin.role,
      });
    }

    let emailSent = false;
    if (resendKey) {
      emailSent = await sendEmail(resendKey, admin.email, admin.full_name, tempPassword, adminLoginUrl);
      console.log(`Email sent to ${admin.email}: ${emailSent}`);
    }

    results.push({
      email: admin.email,
      success: true,
      user_id: newUser.user?.id,
      email_sent: emailSent,
      temp_password: tempPassword,
    });
  }

  return new Response(JSON.stringify({ results, login_url: adminLoginUrl }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
