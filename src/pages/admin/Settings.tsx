import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    siteName: "Solution Villa",
    tagline: "The Digital YES",
    email: "hello@solutionvilla.com",
    phone: "+234 800 000 0000",
    address: "14 Marina Street, Victoria Island, Lagos, Nigeria",
    twitter: "#",
    linkedin: "#",
    facebook: "#",
    instagram: "#",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Settings saved", description: "Site settings have been updated." });
  };

  const Field = ({ label, name, type = "text" }: { label: string; name: keyof typeof form; type?: string }) => (
    <div>
      <label className="text-white/60 text-xs font-semibold uppercase mb-1.5 block">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all"
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-white font-black text-2xl">Settings</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-lg border-b border-white/8 pb-3">General</h2>
            <Field label="Site Name" name="siteName" />
            <Field label="Tagline" name="tagline" />
          </div>

          {/* Contact */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-lg border-b border-white/8 pb-3">Contact Information</h2>
            <Field label="Email Address" name="email" type="email" />
            <Field label="Phone Number" name="phone" type="tel" />
            <Field label="Office Address" name="address" />
          </div>

          {/* Social */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-lg border-b border-white/8 pb-3">Social Media</h2>
            <Field label="Twitter URL" name="twitter" />
            <Field label="LinkedIn URL" name="linkedin" />
            <Field label="Facebook URL" name="facebook" />
            <Field label="Instagram URL" name="instagram" />
          </div>

          <button type="submit" className="flex items-center gap-2 gradient-brand text-white font-semibold px-6 py-3 rounded-full btn-glow hover:scale-105 transition-all">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
