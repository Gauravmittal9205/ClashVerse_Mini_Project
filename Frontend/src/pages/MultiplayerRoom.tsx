import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Users, Play, Code, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface Player {
    uid: string;
    name: string;
    avatar: string;
    isReady: boolean;
    isHost?: boolean;
}

export default function MultiplayerRoom() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Mock initial data based on configuration from previous screen
    // Ideally we'd fetch this from the backend
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (!user) {
            toast.error("Please login first to enter lobby!");
            navigate("/arena/coding");
            return;
        }

        // Add the current user as the host automatically upon entry
        setPlayers([
            {
                uid: user.uid,
                name: user.displayName || "Unknown Player",
                avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'host'}`,
                isReady: false,
                isHost: true,
            }
        ]);

        // Simulate a new player joining after a few seconds to show off the UI
        const timeout = setTimeout(() => {
            setPlayers(prev => [
                ...prev,
                {
                    uid: "dummy_uid_402",
                    name: "CodeNinja99",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeNinja99",
                    isReady: true,
                    isHost: false,
                }
            ]);
            toast.success("CodeNinja99 has joined the room!");
        }, 4000);

        return () => clearTimeout(timeout);
    }, [user, navigate, roomCode]);

    const handleCopyCode = () => {
        if (roomCode) {
            navigator.clipboard.writeText(roomCode);
            toast.success("Code copied to clipboard!");
        }
    };

    const toggleReadyStatus = () => {
        setPlayers(prev => prev.map(p => p.uid === user?.uid ? { ...p, isReady: !p.isReady } : p));
    };

    const isAllReady = players.length > 1 && players.every(p => p.isReady || p.isHost);
    const currentUser = players.find(p => p.uid === user?.uid);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

            {/* Header Navbar */}
            <header className="h-20 border-b border-primary/20 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Code className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-display font-black text-xl tracking-widest uppercase">Multiplayer Lobby</h1>
                        <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Private Match</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div
                        className="flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={handleCopyCode}
                    >
                        <div className="text-secondary/80 font-mono font-bold tracking-widest">
                            CODE: <span className="text-white text-lg ml-2">{roomCode?.slice(0, 4)}-{roomCode?.slice(4)}</span>
                        </div>
                        <Copy className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <button
                        onClick={() => navigate('/arena/coding')}
                        className="text-xs font-black uppercase text-red-500 hover:text-red-400 tracking-[0.2em]"
                    >
                        [ LEAVE ROOM ]
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-12 flex flex-col lg:flex-row gap-8">
                {/* Left Side: Players Roster */}
                <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-glow-neon">
                    <h3 className="font-display font-black text-2xl uppercase tracking-widest mb-2 flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary" /> Combatants
                    </h3>
                    <p className="text-xs text-muted-foreground font-bold tracking-[0.2em] uppercase mb-8">
                        {players.length} / 4 PLAYERS JOINED
                    </p>

                    <div className="space-y-4">
                        {players.map((p) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={p.uid}
                                className={`flex items-center justify-between p-4 rounded-xl border ${p.isHost ? "border-primary/50 bg-primary/5" : "border-white/10 bg-white/5"} relative overflow-hidden`}
                            >
                                {p.isHost && (
                                    <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
                                )}

                                <div className="flex items-center gap-4 relative z-10">
                                    <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full border-2 border-primary/50 bg-black/50" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black tracking-wider uppercase">{p.name} {p.uid === user?.uid && "(YOU)"}</span>
                                            {p.isHost && <span className="bg-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">Host</span>}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono space-x-2">
                                            <span>Level {Math.floor(Math.random() * 50) + 10}</span>
                                            <span>•</span>
                                            <span className={p.isReady ? "text-green-500" : "text-yellow-500"}>
                                                {p.isReady ? "READY" : p.isHost && !isAllReady ? "WAITING FOR PLAYERS" : "NOT READY"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {p.isReady ? (
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-4" />
                                ) : (
                                    <Clock className="w-6 h-6 text-yellow-500 mr-4 animate-pulse" />
                                )}
                            </motion.div>
                        ))}

                        {/* Empty Slots */}
                        {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                            <div key={`empty-${i}`} className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/5 opacity-50">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 bg-black/40 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-muted-foreground/50" />
                                </div>
                                <div className="text-xs font-black text-muted-foreground/50 tracking-[0.2em] uppercase">
                                    Awaiting Combatant...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Chat & Controls */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6">
                    {/* Lobby Controls */}
                    <div className="glass-card p-6 border-primary/20 border text-center">
                        <div className="mb-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-2">Room Scope</h4>
                            <div className="flex justify-center gap-2">
                                <span className="bg-white/10 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase">Medium</span>
                                <span className="bg-white/10 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase">Ranked</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {!currentUser?.isHost && (
                                <button
                                    onClick={toggleReadyStatus}
                                    className={`w-full py-4 rounded-lg font-black uppercase tracking-[0.2em] border transition-all ${currentUser?.isReady
                                        ? "bg-red-500/20 text-red-500 border-red-500 hover:bg-red-500/30"
                                        : "bg-green-500/20 text-green-500 border-green-500 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                        }`}
                                >
                                    {currentUser?.isReady ? "Cancel Ready" : "I am Ready"}
                                </button>
                            )}

                            {currentUser?.isHost && (
                                <button
                                    onClick={() => {
                                        if (!isAllReady) return toast.error("Wait for everyone to be ready!");
                                        toast.info("Entering battle! (Coming soon...)");
                                    }}
                                    disabled={!isAllReady}
                                    className={`w-full py-5 rounded-lg font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${isAllReady
                                        ? "btn-neon"
                                        : "bg-primary/5 text-primary/50 border border-primary/20 cursor-not-allowed"
                                        }`}
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Launch Battle
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Lobby Chat placeholder */}
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col min-h-[250px]">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-4 pb-2 border-b border-white/10">Team Comms</h4>
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 px-4">
                            <MessageSquare className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="text-xs uppercase tracking-widest font-bold">Lobby chat is encrypted and ready.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
