import { motion, AnimatePresence } from "framer-motion";
import { Code, Users, Scale, Brain, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const modes = [
  {
    id: "coding",
    icon: Code,
    title: "Coding Arena",
    shortDesc: "Real-time competitive coding battles with live submissions, instant feedback...",
    longDesc: "Engage in fast-paced 1v1 or multi-player coding challenges. Our platform supports 20+ languages with a built-in high-performance judge system for real-time accuracy and performance scoring.",
    color: "neon-blue",
    preview: (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono">Two Sum . py</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Running Tests...</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-16 rounded-lg bg-white/5 animate-pulse delay-75" />
        </div>
      </div>
    )
  },
  {
    id: "gd",
    icon: Users,
    title: "GD Rooms",
    shortDesc: "Join moderated group discussions on trending topics. Get scored on...",
    longDesc: "Professional group discussion environment with real-time word cloud generation, speaking time analytics, and collaborative note-taking. Perfect for interview preparation and community brainstorming.",
    color: "neon-purple",
    preview: (
      <div className="space-y-4">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]">P{i}</div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-background bg-neon-purple/20 flex items-center justify-center text-[10px] text-neon-purple">+12</div>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-neon-purple w-2/3" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground italic">
            <span>Current Topic: Future of AI in Workforce</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "debate",
    icon: Scale,
    title: "Debate Arena",
    shortDesc: "1v1 and team debates with timed rounds, audience voting, and AI-scored...",
    longDesc: "Experience structured debates with automated timing, rebuttal rounds, and real-time audience feedback. Our AI analysis provides immediate scores on argument strength and rhetorical impact.",
    color: "neon-cyan",
    preview: (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
            <span>FOR</span>
            <span className="text-muted-foreground/50">AI will create more jobs...</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} className="h-full bg-neon-cyan" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neon-purple">
            <span>AGAINST</span>
            <span className="text-muted-foreground/50">Automation risks outweigh...</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-neon-purple" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: "quiz",
    icon: Brain,
    title: "Quiz Arena",
    shortDesc: "Fast-paced quizzes with real-time scoring, streak bonuses, and competitive...",
    longDesc: "Dynamic quiz environment featuring daily tournaments, field-specific questions, and high-stakes speed rounds. Rise through the ranks by mastering topics from CS fundamentals to global tech trends.",
    color: "neon-blue",
    preview: (
      <div className="flex flex-col items-center justify-center h-full py-4">
        <div className="w-16 h-16 rounded-full border-4 border-neon-blue border-t-transparent animate-spin mb-4" />
        <div className="text-center">
          <p className="text-xs font-mono mb-1">Time Remaining</p>
          <p className="text-2xl font-display font-bold text-neon-blue">00:45</p>
        </div>
      </div>
    )
  }
];

const BattleModes = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(modes[2].id); // Default to Debate

  const activeMode = modes.find(m => m.id === activeId)!;

  return (
    <section id="modes" className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Choose Your <span className="neon-text">Battle Mode</span>
          </h2>
          <p className="font-body text-muted-foreground uppercase tracking-[0.3em] text-xs font-semibold">
            Four battlegrounds, one platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Selectors */}
          <div className="lg:col-span-5 space-y-4">
            {modes.map((mode) => {
              const isActive = activeId === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveId(mode.id)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border flex items-center justify-between group ${isActive
                    ? "bg-white/5 border-neon-cyan/40 shadow-[0_0_30px_rgba(20,184,166,0.1)]"
                    : "bg-transparent border-white/5 hover:border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isActive ? "bg-neon-cyan/20 text-neon-cyan" : "bg-white/5 text-muted-foreground"
                      }`}>
                      <mode.icon className="w-6 h-6" />
                    </div>
                    <div className="max-w-[240px]">
                      <h3 className={`font-display text-base font-bold mb-1 transition-colors ${isActive ? "text-white" : "text-muted-foreground/60"}`}>
                        {mode.title}
                      </h3>
                      <p className="font-body text-[11px] text-muted-foreground/50 line-clamp-1">
                        {mode.shortDesc}
                      </p>
                    </div>
                  </div>
                  {isActive ? (
                    <ChevronDown className="w-5 h-5 text-neon-cyan" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side: Preview Display */}
          <div className="lg:col-span-7 h-full min-h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="glass-card h-full p-8 md:p-12 border-white/5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-display text-3xl font-bold mb-6">{activeMode.title}</h3>
                  <p className="font-body text-base text-muted-foreground leading-relaxed mb-10">
                    {activeMode.longDesc}
                  </p>
                </div>

                <div className="relative p-8 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                  {/* Visual Preview */}
                  {activeMode.preview}
                </div>

                <div className="mt-10 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (activeId === "coding") {
                        navigate("/arena/coding");
                      }
                    }}
                    className="btn-neon px-12"
                  >
                    Enter Arena
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BattleModes;
