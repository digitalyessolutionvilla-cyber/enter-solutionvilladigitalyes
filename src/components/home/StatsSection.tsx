import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { stats } from "@/lib/data";

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const dur = 2200;
          const start = performance.now();
          const ease = (t: number) => 1 - Math.pow(2, -10 * t);
          const run = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            setCount(Math.floor(ease(p) * target));
            if (p < 1) requestAnimationFrame(run);
            else setCount(target);
          };
          requestAnimationFrame(run);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="gradient-text text-5xl md:text-6xl font-black tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-20 overflow-hidden" ref={ref}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(0,102,255,0.08) 0%, rgba(0,37,64,0.6) 50%, rgba(0,229,255,0.05) 100%)",
          borderTop: "1px solid rgba(0,102,255,0.15)",
          borderBottom: "1px solid rgba(0,102,255,0.15)",
        }}
      />
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Counter target={stat.value} suffix={stat.suffix} />
              <p className="text-white/55 text-base mt-2 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
