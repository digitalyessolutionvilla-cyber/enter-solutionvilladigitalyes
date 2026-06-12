import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Brand colors
        gold: "#D4AF37",
        "gold-light": "#F5D76E",
        "gold-dark": "#9D7E22",
        "gold-deeper": "#7A5F14",
        "surface-black": "#0A0A0A",
        "surface-dark": "#111111",
        "surface-mid": "#1A1A1A",
        "surface-raised": "#242424",
        "surface-card": "#1E1E1E",
        charcoal: "#2A2A2A",
        success: "hsl(var(--color-success))",
        warning: "hsl(var(--color-warning))",
        error: "hsl(var(--color-error))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 8px)",
        "2xl": "calc(var(--radius) + 16px)",
        "3xl": "calc(var(--radius) + 24px)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(212,175,55,0.35), 0 4px 16px rgba(0,0,0,0.4)",
        "glow-lg": "0 0 40px rgba(212,175,55,0.6), 0 8px 24px rgba(0,0,0,0.5)",
        "glow-gold": "0 0 30px rgba(212,175,55,0.5)",
        "glow-intense": "0 0 60px rgba(212,175,55,0.8), 0 0 100px rgba(212,175,55,0.3)",
        glass: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.06)",
        "glass-hover": "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.12)",
        luxury: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.15)",
        "luxury-hover": "0 40px 80px rgba(0,0,0,0.9), 0 0 40px rgba(212,175,55,0.2)",
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #111111 100%)",
        "gradient-brand":
          "linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #B8962E 100%)",
        "gradient-gold":
          "linear-gradient(90deg, #9D7E22 0%, #D4AF37 30%, #F5D76E 60%, #D4AF37 100%)",
        "gradient-gold-v":
          "linear-gradient(180deg, #D4AF37 0%, #F5D76E 50%, #B8962E 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)",
        "gradient-text":
          "linear-gradient(90deg, #D4AF37, #F5D76E, #D4AF37)",
        "gradient-glow":
          "radial-gradient(ellipse at center, rgba(212,175,55,0.25) 0%, transparent 70%)",
        "gradient-radial-gold":
          "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.25", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.08)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "gold-shimmer": {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "gold-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212,175,55,0.25)" },
          "50%": { boxShadow: "0 0 60px rgba(212,175,55,0.6), 0 0 100px rgba(212,175,55,0.2)" },
        },
        "orb-pulse": {
          "0%, 100%": { transform: "scale(1) translate(0, 0)", opacity: "0.3" },
          "33%": { transform: "scale(1.12) translate(10px, -15px)", opacity: "0.5" },
          "66%": { transform: "scale(0.9) translate(-10px, 10px)", opacity: "0.2" },
        },
        "luxury-reveal": {
          from: { opacity: "0", transform: "translateY(40px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "bounce-soft": "bounce-soft 2.5s ease-in-out infinite",
        "spin-slow": "spin-slow 24s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
        "gold-shimmer": "gold-shimmer 4s linear infinite",
        "gold-pulse": "gold-pulse 3s ease-in-out infinite",
        "orb-pulse": "orb-pulse 10s ease-in-out infinite",
        "luxury-reveal": "luxury-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
