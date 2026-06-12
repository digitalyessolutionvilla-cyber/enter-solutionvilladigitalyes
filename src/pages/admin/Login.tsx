import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Crown, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/admin/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError("Invalid email or password. Please try again.");
    } else {
      navigate("/admin/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at center, rgba(212,175,55,0.07) 0%, transparent 70%)" }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card */}
        <div className="glass-card rounded-3xl p-10 border border-[rgba(212,175,55,0.15)]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-glow-lg mb-4">
              <Crown className="w-8 h-8 text-[#0A0A0A]" />
            </div>
            <h1 className="text-white font-display font-black text-2xl text-center">Solution Villa</h1>
            <p className="gradient-text-static text-xs font-bold tracking-[0.25em] uppercase mt-1">Admin Portal</p>
          </div>

          <h2 className="text-white/70 text-center text-sm mb-7 font-light">
            Sign in to your admin account
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/50 text-xs font-semibold tracking-wider uppercase block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@solutionvilla.com"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37] focus:bg-[rgba(212,175,55,0.05)] transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold tracking-wider uppercase block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37] focus:bg-[rgba(212,175,55,0.05)] transition-all duration-200 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 gradient-brand text-[#0A0A0A] font-bold py-3.5 rounded-xl btn-glow hover:opacity-90 transition-all duration-200 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Solution Villa © {new Date().getFullYear()} · Admin Access Only
        </p>
      </div>
    </div>
  );
}
