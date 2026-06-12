import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const { user, signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) setError("Invalid email or password. Please try again.");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#060F1E] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #0066FF 0%, transparent 70%)" }} />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #00E5FF 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow-lg">
            <span className="text-white font-black text-xl">SV</span>
          </div>
          <h1 className="text-white font-black text-2xl">Admin Portal</h1>
          <p className="text-white/50 text-sm mt-1">Solution Villa – The Digital YES</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-white font-bold text-xl mb-6">Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 bg-[rgba(255,77,106,0.1)] border border-[rgba(255,77,106,0.3)] text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/70 text-sm font-semibold block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all"
                  placeholder="admin@solutionvilla.com"
                />
              </div>
            </div>
            <div>
              <label className="text-white/70 text-sm font-semibold block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={submitting}
              className="w-full gradient-brand text-white font-bold py-3.5 rounded-full btn-glow hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Protected area. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
}
