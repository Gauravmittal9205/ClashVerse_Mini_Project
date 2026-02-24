import { motion } from "framer-motion";
import { TrendingUp, Award, Flame, Medal, BarChart3, Crown, Trophy, ShieldCheck, Star } from "lucide-react";

const ranks = [
  { name: "Bronze", color: "text-orange-400", bg: "bg-orange-400/10", icon: Medal },
  { name: "Silver", color: "text-gray-300", bg: "bg-gray-300/10", icon: ShieldCheck },
  { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Star },
  { name: "Elite", color: "text-neon-blue", bg: "bg-neon-blue/10", icon: Trophy },
  { name: "Legend", color: "text-neon-purple", bg: "bg-neon-purple/10", icon: Crown },
];

const features = [
  {
    icon: TrendingUp,
    title: "XP & Level System",
    desc: "Earn XP from every battle. Level up and unlock exclusive rewards.",
  },
  {
    icon: Award,
    title: "Achievement Badges",
    desc: "Collect rare badges for special milestones and victories.",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    desc: "Maintain your streak for bonus XP and special perks.",
  },
  {
    icon: BarChart3,
    title: "Live Leaderboards",
    desc: "Compete globally and track your rank in real-time.",
  },
];

const Gamification = () => {
  return (
    <section id="gamification" className="section-padding relative">
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Level Up <span className="neon-text">Your Skills</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            A complete gamification ecosystem to fuel your growth.
          </p>
        </motion.div>

        {/* Rank tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 md:p-8 mb-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Medal className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Rank Tiers</h3>
          </div>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            {ranks.map((rank, i) => (
              <div key={rank.name} className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`${rank.bg} ${rank.color} border border-current/20 rounded-xl px-5 py-3 font-display text-sm font-bold flex items-center gap-3 shadow-lg backdrop-blur-sm hover:scale-105 transition-transform cursor-default group`}
                >
                  <rank.icon className="w-5 h-5 drop-shadow-[0_0_8px_currentColor] group-hover:animate-pulse" />
                  {rank.name}
                </motion.div>
                {i < ranks.length - 1 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="text-muted-foreground/30 text-xl font-light hidden md:block"
                  >
                    →
                  </motion.span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 text-center"
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--gradient-neon)" }}>
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-sm font-semibold mb-2">{f.title}</h3>
              <p className="font-body text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gamification;
