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
        "deep-blue": "#0A2540",
        "electric-blue": "#0066FF",
        "neon-cyan": "#00E5FF",
        "surface-dark": "#060F1E",
        "surface-mid": "#0A2540",
        "surface-raised": "#0D2D4E",
        "neutral-mid": "#4A6080",
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
        glow: "0 0 24px rgba(0, 102, 255, 0.45)",
        "glow-lg": "0 0 40px rgba(0, 102, 255, 0.70)",
        "glow-cyan": "0 0 24px rgba(0, 229, 255, 0.40)",
        glass:
          "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,229,255,0.06)",
        "glass-hover":
          "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.15)",
        card: "0 4px 24px rgba(0,0,0,0.3)",
        "card-hover": "0 16px 48px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #060F1E 0%, #0A2540 45%, #001A4D 100%)",
        "gradient-brand":
          "linear-gradient(90deg, #0066FF 0%, #00E5FF 100%)",
        "gradient-brand-135":
          "linear-gradient(135deg, #0066FF 0%, #00E5FF 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(0,229,255,0.05) 100%)",
        "gradient-text":
          "linear-gradient(90deg, #0066FF, #00E5FF)",
        "gradient-glow":
          "radial-gradient(ellipse at center, rgba(0,102,255,0.35) 0%, transparent 70%)",
        "gradient-section":
          "linear-gradient(180deg, #060F1E 0%, #0A2540 50%, #060F1E 100%)",
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
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.05)" },
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
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "orb-pulse": {
          "0%, 100%": { transform: "scale(1) translate(0, 0)", opacity: "0.4" },
          "33%": { transform: "scale(1.1) translate(10px, -15px)", opacity: "0.6" },
          "66%": { transform: "scale(0.9) translate(-10px, 10px)", opacity: "0.3" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "bounce-soft": "bounce-soft 2.5s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "orb-pulse": "orb-pulse 8s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
