import { Link } from "react-router-dom";
import { Twitter, Linkedin, Facebook, Instagram, Youtube, Send } from "lucide-react";
import { footerLinks } from "@/lib/data";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const socials = [
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Youtube, label: "YouTube", href: "#" },
  ];

  return (
    <footer className="bg-[#060F1E] border-t border-white/8">
      <div className="container-custom py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center shadow-glow">
                <span className="text-white font-black text-sm">SV</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold text-base">Solution Villa</span>
                <span className="gradient-text text-[10px] font-semibold tracking-widest uppercase">
                  The Digital YES
                </span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Africa's premier technology and digital solutions agency. We turn ideas into digital success stories across branding, tech, marketing, and media.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/6 border border-white/10 text-white/60 hover:gradient-brand hover:text-white hover:border-transparent hover:scale-110 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#00E5FF] text-xs font-bold uppercase tracking-widest mb-4">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-white/50 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#00E5FF] text-xs font-bold uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-white/50 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[#00E5FF] text-xs font-bold uppercase tracking-widest mb-4">Newsletter</h4>
            <p className="text-white/50 text-sm mb-4">
              Get the latest insights on digital innovation in Africa.
            </p>
            {subscribed ? (
              <p className="text-[#00E5FF] text-sm font-medium">Thanks for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex rounded-full overflow-hidden border border-white/15 bg-white/5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none min-w-0"
                  required
                />
                <button
                  type="submit"
                  className="gradient-brand px-4 py-2.5 text-white hover:opacity-90 transition-opacity"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
            <div className="mt-8">
              <h4 className="text-[#00E5FF] text-xs font-bold uppercase tracking-widest mb-3">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-white/40 text-sm hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Solution Villa. All rights reserved.
          </p>
          <p className="text-white/30 text-sm">
            Proudly serving Africa's digital future.
          </p>
        </div>
      </div>
    </footer>
  );
}
