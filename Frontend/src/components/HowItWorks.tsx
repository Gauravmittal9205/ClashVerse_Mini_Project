import { motion } from "framer-motion";
import { UserPlus, Swords, Radio, TrendingUp } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Sign Up", desc: "Create your free warrior profile in seconds." },
  { icon: Swords, title: "Choose Battle Mode", desc: "Pick from Coding, GD, Debate, or Quiz arenas." },
  { icon: Radio, title: "Compete in Real-Time", desc: "Face opponents live and prove your skills." },
  { icon: TrendingUp, title: "Earn XP & Rise", desc: "Gain XP, level up, and climb the leaderboard." },
];

const HowItWorks = () => {
  return (
    <section className="section-padding relative">
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            How It <span className="neon-text">Works</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            Four simple steps to arena glory.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative text-center"
            >
              {/* Step number */}
              <div className="font-display text-6xl font-bold text-muted/50 mb-2">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "var(--gradient-neon)" }}
              >
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-sm font-semibold mb-2">{step.title}</h3>
              <p className="font-body text-xs text-muted-foreground">{step.desc}</p>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 right-0 translate-x-1/2 w-full h-px bg-gradient-to-r from-neon-purple/30 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
