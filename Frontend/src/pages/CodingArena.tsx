import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Swords,
    Users,
    Zap,
    Trophy,
    Timer,
    Brain,
    Flame,
    ChevronRight,
    Star,
    Users2,
    Lock,
    Code
} from "lucide-react";

interface ArenaMode {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    stats: string;
    features: string[];
    badge?: string;
}

const arenaModes: ArenaMode[] = [
    {
        id: "1v1",
        title: "1v1 LIVE DUEL",
        description: "Battle 1v1 in real-time. Jo pehle solve karega, wahi winner!",
        icon: Swords,
        color: "from-neon-blue to-neon-cyan",
        stats: "2,450 Live Duels",
        features: [
            "Random Opponent Matching",
            "Live Status (Opponent Typing...)",
            "Instant Test Case Evaluation",
            "XP & Rank Rewards"
        ],
        badge: "Most Popular"
    },
    {
        id: "multiplayer",
        title: "Multiplayer Battle",
        description: "Upto 5 players. Clash of the best minds in a single room.",
        icon: Users2,
        color: "from-neon-purple to-primary",
        stats: "150 Rooms Active",
        features: [
            "Upto 5 Simultaneous Players",
            "Dynamic Leaderboard",
            "Efficiency & Speed Scoring",
            "Custom Room Codes"
        ]
    },
    {
        id: "topic",
        title: "Topic-Based Arena",
        description: "Choose your weapon: Arrays, DP, Graphs. Train at your pace.",
        icon: Brain,
        color: "from-emerald-400 to-cyan-400",
        stats: "10+ Topics",
        features: [
            "Topic Selection (Arrays, DP, etc.)",
            "Company Tags (Amazon, Google)",
            "Survival Mode (Wrong = Out!)",
            "Difficulty Customization"
        ]
    },
    {
        id: "speed",
        title: "Speed Challenge",
        description: "10 Questions, 20 Minutes. High speed, High XP.",
        icon: Zap,
        color: "from-orange-400 to-rose-500",
        stats: "Daily Challenge Live",
        features: [
            "Intense 20-min Rounds",
            "XP Multiplier System",
            "Combo Streak Bonuses",
            "Daily Global Rankings"
        ],
        badge: "Elite Only"
    }
];

const CodingArena = () => {
    const [viewedModeId, setViewedModeId] = useState<string>(arenaModes[0].id);
    const [matchmakingModeId, setMatchmakingModeId] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Technical Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

            {/* Scanning Line Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(139,92,246,0.05),transparent)] bg-[size:100%_4px] animate-scanline pointer-events-none -z-10" />

            <Navbar />

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full -z-10" />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <section className="mb-24 text-center relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative inline-block"
                    >
                        {/* Technical Brackets */}
                        <div className="absolute -top-8 -left-8 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
                        <div className="absolute -top-8 -right-8 w-12 h-12 border-t-2 border-r-2 border-secondary/40 rounded-tr-xl" />
                        <div className="absolute -bottom-8 -left-8 w-12 h-12 border-b-2 border-l-2 border-secondary/40 rounded-bl-xl" />
                        <div className="absolute -bottom-8 -right-8 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />

                        <div className="relative z-10 p-4">
                            <h1 className="font-display text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase relative">
                                <span className="absolute inset-0 text-primary/20 blur-lg translate-y-1">CODING ARENA</span>
                                <span className="relative">CODING <span className="neon-text">ARENA</span></span>
                            </h1>

                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
                                <p className="font-body text-primary/80 text-xs font-black uppercase tracking-[0.4em]">
                                    Phase 01: The Awakening
                                </p>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
                            </div>

                            <p className="font-body text-muted-foreground text-sm md:text-base max-w-xl mx-auto uppercase tracking-[0.2em] font-medium leading-relaxed">
                                Enter the battlefield. Code with intensity. <br />
                                <span className="text-foreground font-bold">Rule the global leaderboard.</span>
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* Global Stats HUD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative mb-20"
                >
                    {/* HUD Border Effect */}
                    <div className="absolute inset-0 border-x border-primary/20 bg-primary/5 rounded-2xl transform skew-x-[-10deg] -z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-2xl -z-20" />

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 p-2 glass-card border-white/5 shadow-glow-neon">
                        <div className="flex items-center justify-center gap-6 p-6 group">
                            <div className="p-3 rounded-xl bg-neon-blue/10 border border-neon-blue/20 group-hover:shadow-glow-blue transition-all">
                                <Users className="w-5 h-5 text-neon-blue" />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Live Combatants</span>
                                <span className="text-lg font-display font-black text-foreground tabular-nums tracking-wider text-neon-blue">1,240 ONLINE</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6 p-6 group">
                            <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 group-hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Finalized Clashes</span>
                                <span className="text-lg font-display font-black text-foreground tabular-nums tracking-wider">492,450 TOTAL</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6 p-6 group">
                            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all">
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Multiplier</span>
                                <span className="text-lg font-display font-black text-orange-500 tabular-nums tracking-wider">1.5X BOOST</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Game Modes Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
                    {/* Left Side: Mode Selectors */}
                    <div className="lg:col-span-5 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-6 pl-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Select Battle Protocol
                        </h4>
                        {arenaModes.map((mode) => {
                            const isActive = viewedModeId === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setViewedModeId(mode.id)}
                                    className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border flex items-center justify-between group relative overflow-hidden ${isActive
                                        ? "bg-primary/10 border-primary/40 shadow-glow-neon"
                                        : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/5"
                                        }`}
                                >
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? `bg-gradient-to-br ${mode.color} text-white shadow-lg` : "bg-white/5 text-muted-foreground group-hover:text-foreground"
                                            }`}>
                                            <mode.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`font-display text-base font-bold mb-1 transition-colors ${isActive ? "text-white" : "text-muted-foreground"}`}>
                                                {mode.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-primary" : "text-muted-foreground/40"}`}>
                                                    {mode.stats.split(' ')[0]}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/20 italic">ACTIVE</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isActive ? (
                                        <motion.div layoutId="activeIndicator" className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                            <ChevronRight className="w-5 h-5 text-primary" />
                                        </motion.div>
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-transform group-hover:translate-x-1" />
                                    )}

                                    {/* Hover Trace Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:translate-x-full duration-1000" />
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Side: Mode Details Panel */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {(() => {
                                const mode = arenaModes.find(m => m.id === viewedModeId)!;
                                return (
                                    <motion.div
                                        key={mode.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="glass-card p-10 lg:p-14 border-white/5 relative overflow-hidden h-full min-h-[500px] flex flex-col justify-between"
                                    >
                                        {/* Corner Technical Detail */}
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <mode.icon className="w-32 h-32 rotate-12" />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className={`h-1 w-12 bg-gradient-to-br ${mode.color}`} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Protocol Details</span>
                                            </div>

                                            <h2 className="font-display text-4xl lg:text-5xl font-black mb-6 group-hover:neon-text transition-all tracking-tight uppercase">
                                                {mode.title}
                                            </h2>

                                            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">
                                                {mode.description}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                                                {mode.features.map((feature, i) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        key={i}
                                                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group/feat"
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        <span className="text-xs font-bold text-muted-foreground group-hover/feat:text-foreground uppercase tracking-widest">{feature}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
                                            <button
                                                onClick={() => setMatchmakingModeId(mode.id)}
                                                className="w-full sm:w-auto btn-neon px-12 py-5 flex items-center justify-center gap-4 group"
                                            >
                                                <Zap className="w-5 h-5 fill-current animate-pulse font-black" />
                                                <span className="font-black uppercase tracking-[0.2em] text-base">INITIALIZE BATTLE</span>
                                            </button>

                                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl border border-white/5 bg-white/5">
                                                <Users className="w-4 h-4 text-neon-blue" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{mode.stats}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Global Leaderboard Shortcut / Call to Action */}
                <section className="relative p-12 glass-card border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
                            <Star className="w-4 h-4 text-primary fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Limited Time Event</span>
                        </div>
                        <h2 className="font-display text-4xl font-black mb-6">WEEKLY <span className="neon-text">CLASH TOURNAMENT</span></h2>
                        <p className="text-muted-foreground mb-10 leading-relaxed uppercase tracking-widest text-xs font-bold">
                            Winner gets 5000 XP + Exclusive 'Gladiator' Profile Badge.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button className="btn-neon px-12">Register Now</button>
                            <button className="btn-outline-neon px-12">View Details</button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            {/* Mode Selection Modal */}
            <AnimatePresence>
                {matchmakingModeId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMatchmakingModeId(null)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl glass-card border-white/10 p-8 md:p-12 overflow-hidden shadow-glow-neon"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        {(() => {
                                            const mode = arenaModes.find(m => m.id === matchmakingModeId);
                                            const Icon = mode?.icon || Code;
                                            return <Icon className="w-6 h-6 text-primary" />;
                                        })()}
                                    </div>
                                    <h2 className="font-display text-3xl font-black uppercase tracking-tight">
                                        {arenaModes.find(m => m.id === matchmakingModeId)?.title}
                                    </h2>
                                </div>
                                <button onClick={() => setMatchmakingModeId(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">Select Topic</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Arrays", "DP", "Graph", "String", "Tree", "Recursion"].map(topic => (
                                            <button key={topic} className="p-3 rounded-lg border border-white/5 bg-white/5 hover:border-primary/50 text-[11px] font-bold uppercase transition-all tracking-wide">
                                                {topic}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">Complexity Level</h4>
                                    <div className="space-y-3">
                                        {["Initiate (Easy)", "Elite (Medium)", "Grandmaster (Hard)"].map(level => (
                                            <button key={level} className="w-full p-4 rounded-lg border border-white/5 bg-white/5 hover:border-secondary/50 text-xs font-bold uppercase transition-all text-left flex justify-between items-center group">
                                                {level}
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-10 flex items-start gap-4">
                                <Timer className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                    <h5 className="text-xs font-black text-red-500 uppercase mb-1">Warning: Ranked Battle</h5>
                                    <p className="text-[10px] text-muted-foreground/80 leading-relaxed uppercase tracking-tight font-bold">
                                        Quitting early may result in a rank penalty (-50 XP).
                                    </p>
                                </div>
                            </div>

                            <button className="w-full btn-neon py-5 flex items-center justify-center gap-4 group">
                                <Zap className="w-5 h-5 fill-current animate-pulse" />
                                <span className="font-black text-lg tracking-[0.3em]">START MATCHMAKING</span>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CodingArena;
