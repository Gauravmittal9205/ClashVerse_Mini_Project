import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Users,
    Plus,
    LogIn,
    Mic2,
    MessageSquare,
    Trophy,
    Zap,
    Shield,
    Search,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const DebateArena = () => {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateRoom = (mode: '1v1' | 'Team') => {
        const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        toast.success(`Creating ${mode} room ${newRoomCode}...`);
        // We can pass the mode as a param, e.g. /arena/debate/ABCDE?mode=1v1
        navigate(`/arena/debate/${newRoomCode}?mode=${mode}`);
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomCode.length < 4) {
            toast.error("Please enter a valid room code.");
            return;
        }
        setIsJoining(true);
        setTimeout(() => {
            toast.success("Joining room...");
            setIsJoining(false);
            navigate(`/arena/debate/${roomCode}`);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full -z-10" />

            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Hero / Header Section */}
                <section className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                            <Mic2 className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Debate Arena</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase relative">
                            <span className="absolute inset-0 text-primary/20 blur-lg translate-y-2">VOICE OF CLASH</span>
                            <span className="relative">VOICE OF <span className="neon-text">CLASH</span></span>
                        </h1>
                        <p className="font-body text-muted-foreground text-sm md:text-base max-w-2xl mx-auto uppercase tracking-[0.2em] font-medium leading-relaxed">
                            Engage in intellectual warfare. Defend your perspective, <br />
                            <span className="text-foreground font-bold">conquer the argument, rule the stage.</span>
                        </p>
                    </motion.div>
                </section>

                {/* Main Interaction Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {/* Create Room Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        whileHover={{ y: -5 }}
                    >
                        <Card className="glass-card border-white/5 overflow-hidden h-full group relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Plus className="w-40 h-40" />
                            </div>
                            <CardHeader className="p-8">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                                    <Plus className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-display font-black uppercase tracking-tight mb-2">Create Room</CardTitle>
                                <CardDescription className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
                                    Start a new debate session and invite friends
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Custom Mode Selection
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Private Room Link
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Moderator Controls
                                    </li>
                                </ul>
                                {!isCreating ? (
                                    <Button
                                        onClick={() => setIsCreating(true)}
                                        className="w-full btn-neon py-6 flex items-center justify-center gap-3 group/btn"
                                    >
                                        <Zap className="w-5 h-5 fill-current animate-pulse" />
                                        <span className="font-black uppercase tracking-[0.2em]">Launch Session</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <Button
                                            onClick={() => handleCreateRoom('1v1')}
                                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase py-6 transition-all shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:border-primary/50"
                                        >
                                            <Mic2 className="w-4 h-4 mr-2 text-primary" />
                                            1v1 Duel
                                        </Button>
                                        <Button
                                            onClick={() => handleCreateRoom('Team')}
                                            className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white font-black uppercase py-6 transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                                        >
                                            <Users className="w-4 h-4 mr-2 text-primary" />
                                            Team Skirmish
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full text-[10px] text-muted-foreground uppercase opacity-70 hover:opacity-100"
                                            onClick={() => setIsCreating(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Join Room Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        whileHover={{ y: -5 }}
                    >
                        <Card className="glass-card border-white/5 overflow-hidden h-full group relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <LogIn className="w-40 h-40" />
                            </div>
                            <CardHeader className="p-8">
                                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20">
                                    <LogIn className="w-8 h-8 text-secondary" />
                                </div>
                                <CardTitle className="text-3xl font-display font-black uppercase tracking-tight mb-2">Join Room</CardTitle>
                                <CardDescription className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
                                    Enter a room code to participate in a live duel
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <form onSubmit={handleJoinRoom} className="space-y-6">
                                    <div className="relative">
                                        <Input
                                            placeholder="ENTER ROOM CODE"
                                            value={roomCode}
                                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                            className="bg-white/5 border-white/10 py-6 px-4 text-center font-display text-xl tracking-[0.5em] focus:border-secondary/50 transition-all placeholder:tracking-normal placeholder:text-xs"
                                        />
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-50">
                                            <Search className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isJoining}
                                        className="w-full bg-secondary hover:bg-secondary/80 text-white font-black uppercase tracking-[0.2em] py-6 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all flex items-center justify-center gap-3"
                                    >
                                        {isJoining ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <LogIn className="w-5 h-5" />
                                        )}
                                        {isJoining ? "Connecting..." : "Enter Battle"}
                                    </Button>
                                </form>
                                <div className="mt-8 flex items-center justify-center gap-4 text-muted-foreground">
                                    <div className="h-px flex-1 bg-white/5" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Quick Join</span>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {["DBA-12", "CLASH", "VOX"].map(code => (
                                        <button
                                            key={code}
                                            onClick={() => setRoomCode(code)}
                                            className="p-2 rounded bg-white/5 border border-white/5 hover:border-secondary/30 text-[10px] font-bold transition-all"
                                        >
                                            {code}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Stats / Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 text-center">
                    <div className="p-8 glass-card border-white/5">
                        <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                        <h4 className="text-2xl font-black mb-1">1,240</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Active Debaters</p>
                    </div>
                    <div className="p-8 glass-card border-white/5">
                        <MessageSquare className="w-8 h-8 text-secondary mx-auto mb-4" />
                        <h4 className="text-2xl font-black mb-1">452</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Live Rooms</p>
                    </div>
                    <div className="p-8 glass-card border-white/5">
                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                        <h4 className="text-2xl font-black mb-1">89,200</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Points Awarded</p>
                    </div>
                </div>

                {/* Rules / Tip Section */}
                <section className="relative p-12 glass-card border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-3xl font-black mb-6 uppercase tracking-tight">Debate <span className="neon-text">Protocols</span></h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                        <Shield className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm uppercase tracking-wider mb-1">Respect the Floor</h5>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Wait for your turn to speak. Interruption results in penalty points.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                        <Zap className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm uppercase tracking-wider mb-1">Quick Thinking</h5>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Use facts and logic. Emotional arguments carry lower weightage.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="aspect-video rounded-2xl overflow-hidden glass-card border-white/10 flex items-center justify-center">
                                <div className="absolute inset-0 bg-primary/20 animate-pulse pointer-events-none" />
                                <Mic2 className="w-20 h-20 text-white/20 group-hover:text-primary/40 transition-colors" />
                                <span className="absolute bottom-6 text-[10px] font-black uppercase tracking-widest opacity-40">System Monitoring Active</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default DebateArena;
