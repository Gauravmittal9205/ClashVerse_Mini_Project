import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "ByteStorm", title: "Legend", xp: "12,450 XP", icon: "🏆", trend: "up" },
  { rank: 2, name: "CodePhoenix", title: "Master", xp: "11,200 XP", icon: "⚡", trend: "up" },
  { rank: 3, name: "QuantumDev", title: "Master", xp: "10,800 XP", icon: "🔥", trend: "neutral" },
  { rank: 4, name: "NeuralNinja", title: "Diamond", xp: "9,950 XP", icon: "💎", trend: "down" },
  { rank: 5, name: "AlgoAce", title: "Diamond", xp: "9,400 XP", icon: "⭐", trend: "up" },
  { rank: 6, name: "DebugQueen", title: "Platinum", xp: "8,870 XP", icon: "🎯", trend: "up" },
];

const LiveArena = () => {
  return (
    <section id="leaderboard" className="section-padding relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Heading & Stats */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Real-Time <span className="neon-text">Leaderboard</span>
          </h2>
          <p className="font-body text-lg md:text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed">
            Watch the rankings shift in real-time as battles conclude. Every victory counts. Every rank is earned.
          </p>

          <div className="flex flex-wrap gap-12 mb-12">
            <div>
              <h4 className="font-display text-4xl font-bold text-neon-blue mb-1">50K+</h4>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">Global Rankings</p>
            </div>
            <div>
              <h4 className="font-display text-4xl font-bold text-neon-purple mb-1">10K+</h4>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">Daily Battles</p>
            </div>
            <div>
              <h4 className="font-display text-4xl font-bold text-neon-cyan mb-1">200+</h4>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">Colleges</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-neon flex items-center gap-3 text-lg px-10"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            Claim Your Spot
          </motion.button>
        </motion.div>

        {/* Right Column: Leaderboard Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Subtle outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 blur-xl rounded-[2rem] -z-10" />

          <div className="glass-card p-6 md:p-10 relative z-10 border-white/5 backdrop-blur-2xl rounded-[2rem]">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-display text-sm font-bold tracking-[0.2em] uppercase text-foreground/80">Global Rankings</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/20">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_8px_#14b8a6]" />
                <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="space-y-6">
              {leaderboardData.map((user, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-center justify-between group cursor-default"
                >
                  <div className="flex items-center gap-5">
                    <span className={`font-display text-xl font-bold w-6 ${i < 3 ? 'text-neon-blue' : 'text-muted-foreground/30'}`}>
                      {user.rank}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:border-neon-purple/30 transition-all duration-300">
                      {user.icon}
                    </div>
                    <div>
                      <h4 className="font-body font-bold text-base tracking-wide group-hover:neon-text transition-all duration-300">{user.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-0.5">{user.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-display text-sm font-bold text-foreground/90">{user.xp}</span>
                    <div className="w-5 flex justify-center">
                      {user.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                      ) : user.trend === "down" ? (
                        <TrendingDown className="w-4 h-4 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                      ) : (
                        <Minus className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Decorative element */}
            <div className="mt-10 pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em] font-medium">Update Every 30 Seconds</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveArena;
