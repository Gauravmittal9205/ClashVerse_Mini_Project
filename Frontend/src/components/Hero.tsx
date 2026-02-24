import { motion } from "framer-motion";
import { Zap, Trophy } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

      {/* Animated particles/orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: i % 2 === 0
                ? "hsl(270 100% 65% / 0.6)"
                : "hsl(220 100% 60% / 0.6)",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* XP badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8"
        >
          <Zap className="w-4 h-4 text-neon-cyan" />
          <span className="font-body text-sm text-muted-foreground">
            +2,500 XP Earned Today by Players Worldwide
          </span>
          <Trophy className="w-4 h-4 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6"
        >
          Enter the Arena.{" "}
          <span className="neon-text">Learn.</span>{" "}
          <span className="neon-text">Compete.</span>{" "}
          <span className="neon-text">Dominate.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Coding, GD, Debate &amp; Quiz — All in One Competitive Universe.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="#modes" className="btn-neon text-base">
            ⚔ Enter Arena
          </a>
          <a href="#modes" className="btn-outline-neon text-base">
            Explore Modes
          </a>
        </motion.div>

        {/* XP progress bar visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 max-w-md mx-auto"
        >
          <div className="flex justify-between font-body text-xs text-muted-foreground mb-2">
            <span>Level 12 — Warrior</span>
            <span>2,500 / 3,000 XP</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "83%" }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--gradient-neon)" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
