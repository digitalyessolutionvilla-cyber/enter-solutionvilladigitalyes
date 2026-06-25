import { Link } from "react-router-dom";
import { Twitter, Linkedin, Facebook, Instagram, Youtube, Send } from "lucide-react";
import { useState } from "react";
import { useFooterNavigation } from "@/hooks/useNavigation";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { footerLinks as fallbackFooter } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

const COLUMN_LABELS: Record<string, string> = {
  services: "Services",
  company: "Company",
  resources: "Legal",
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subMsg, setSubMsg] = useState("Thank you for subscribing!");
  const footerNav = useFooterNavigation();
  const settings = useSiteSettings();

  const hasFooterNav = Object.keys(footerNav).length > 0;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, source: "footer" }, { onConflict: "email", ignoreDuplicates: false });
    if (!error) {
      setSubMsg("Thank you for subscribing!");
    } else {
      setSubMsg("You're already subscribed!");
    }
    setSubscribed(true);
    setEmail("");
  };

  const socials = [
    { icon: Twitter, label: "Twitter", href: settings.twitter_url || "#" },
    { icon: Linkedin, label: "LinkedIn", href: settings.linkedin_url || "#" },
    { icon: Facebook, label: "Facebook", href: settings.facebook_url || "#" },
    { icon: Instagram, label: "Instagram", href: settings.instagram_url || "#" },
    { icon: Youtube, label: "YouTube", href: settings.youtube_url || "#" },
  ];

  // Use DB footer nav if available, otherwise fall back to data.ts
  const services = hasFooterNav ? footerNav.services : fallbackFooter.services;
  const company = hasFooterNav ? footerNav.company : fallbackFooter.company;
  const resources = hasFooterNav ? footerNav.resources : fallbackFooter.resources;

  return (
    <footer className="bg-[#0A0A0A] border-t border-[rgba(212,175,55,0.1)]">
      <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />

      <div className="container-custom py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center shadow-glow">
                <span className="text-[#0A0A0A] font-black text-sm">SV</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-display font-bold text-base">{settings.site_name || "Solution Villa"}</span>
                <span className="gradient-text-static text-[9px] font-semibold tracking-[0.25em] uppercase">
                  {settings.site_tagline || "The Digital YES"}
                </span>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              {settings.site_description || "Africa's most premium technology and digital solutions agency. We deliver world-class results that transform businesses into industry leaders."}
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[rgba(212,175,55,0.06)] border border-[rgba(212,175,55,0.15)] text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[rgba(212,175,55,0.12)] hover:scale-110 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Services</h4>
            <ul className="space-y-2.5">
              {(services || []).map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-white/40 text-sm hover:text-[#F5D76E] hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {(company || []).map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-white/40 text-sm hover:text-[#F5D76E] hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Legal */}
          <div>
            <h4 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Newsletter</h4>
            <p className="text-white/40 text-sm mb-4 leading-relaxed">
              Get exclusive insights on premium digital innovation.
            </p>
            {subscribed ? (
              <p className="text-[#D4AF37] text-sm font-medium">{subMsg}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex rounded-full overflow-hidden border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.04)]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none min-w-0"
                  required
                />
                <button type="submit" className="gradient-brand px-4 py-2.5 text-[#0A0A0A] hover:opacity-90 transition-opacity" aria-label="Subscribe">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
            <div className="mt-8">
              <h4 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Legal</h4>
              <ul className="space-y-2">
                {(resources || []).map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-white/30 text-sm hover:text-white/60 transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[rgba(212,175,55,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">
            © {new Date().getFullYear()} {settings.site_name || "Solution Villa"}. All rights reserved.
          </p>
          <p className="gradient-text-static text-sm font-semibold tracking-wide">
            Premium Solutions. Premium Results.
          </p>
        </div>
      </div>
    </footer>
  );
}
