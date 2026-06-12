import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/data";

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const start = performance.now();
          const ease = (t: number) => 1 - Math.pow(2, -10 * t);
          const animate = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setCount(Math.floor(ease(p) * target));
            if (p < 1) requestAnimationFrame(animate);
            else setCount(target);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-5xl md:text-6xl font-display font-black gradient-text tabular-nums text-glow">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#111111]" />
      <div className="absolute inset-0 bg-gradient-gold-v opacity-[0.04]" />
      <div className="h-px absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
      <div className="h-px absolute bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center gap-3 ${i < stats.length - 1 ? "md:border-r md:border-[rgba(212,175,55,0.1)]" : ""}`}
            >
              <Counter target={stat.value} suffix={stat.suffix} />
              <div className="luxury-divider w-12" style={{ margin: 0 }} />
              <span className="text-white/45 text-sm font-medium tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
