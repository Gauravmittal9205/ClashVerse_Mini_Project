import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Mic2,
    Users,
    MessageSquare,
    Shield,
    Zap,
    Copy,
    Check,
    LogOut,
    Send,
    User as UserIcon,
    Crown,
    ThumbsUp,
    ThumbsDown,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

interface Participant {
    id: string;
    name: string;
    role: string;
}

const DEBATE_TOPICS = [
    "Artificial Intelligence vs Human Ethics",
    "Should Social Media be Regulated by the Government?",
    "Is Universal Basic Income a Feasible Solution?",
    "Remote Work vs Office Work: Which is the Future?",
    "Does Technology Make Us More Isolated?",
    "Should Crypto-currencies Replace Traditional FIAT?",
    "Are Standardized Tests a Fair Measure of Intelligence?",
    "Should Space Exploration be Privatized?",
    "Are Video Games a Form of Art?"
];

const DebateRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState("");
    const [participants, setParticipants] = useState<Participant[]>([]);

    // Topic & Voting State
    const [topic, setTopic] = useState<string | null>(null);
    const [votes, setVotes] = useState<Record<string, 'like' | 'dislike'>>({});
    const [debateStatus, setDebateStatus] = useState<'lobby' | 'starting' | 'active'>('lobby');
    const [countdown, setCountdown] = useState(5);

    const topicRef = useRef(topic);
    const votesRef = useRef(votes);
    const debateStatusRef = useRef(debateStatus);

    useEffect(() => { topicRef.current = topic; }, [topic]);
    useEffect(() => { votesRef.current = votes; }, [votes]);
    useEffect(() => { debateStatusRef.current = debateStatus; }, [debateStatus]);

    const [currentUserId] = useState(() => user?.uid || `guest_${Math.random().toString(36).substring(2, 9)}`);
    const [currentUserName] = useState(() => user?.displayName || user?.email?.split('@')[0] || `Fighter_${Math.floor(Math.random() * 1000)}`);

    const stompClientRef = useRef<Client | null>(null);

    // Initial setup for the user when they first open the component
    useEffect(() => {
        // Assume I'm moderator initially if I don't see anyone (will be updated if a SYNC comes in)
        setParticipants([{ id: currentUserId, name: currentUserName, role: "Moderator" }]);

        const socket = new SockJS("http://localhost:8081/ws-arena");
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("Connected to Debate Arena WebSocket");
                client.subscribe(`/topic/debate/${roomId}`, (msg) => {
                    const event = JSON.parse(msg.body);
                    handleIncomingEvent(event);
                });

                // Announce that I joined
                client.publish({
                    destination: `/topic/debate/${roomId}`,
                    body: JSON.stringify({ type: "JOIN", id: currentUserId, name: currentUserName })
                });
            },
            onStompError: (frame) => {
                console.error("Broker reported error: " + frame.headers["message"]);
            },
        });

        client.activate();
        stompClientRef.current = client;

        // Leave announcement before closing or unmounting
        const sendLeave = () => {
            if (stompClientRef.current?.connected) {
                stompClientRef.current.publish({
                    destination: `/topic/debate/${roomId}`,
                    body: JSON.stringify({ type: "LEAVE", id: currentUserId })
                });
            }
        };

        window.addEventListener("beforeunload", sendLeave);

        return () => {
            sendLeave();
            window.removeEventListener("beforeunload", sendLeave);
            client.deactivate();
        };
    }, [roomId, currentUserId, currentUserName]);

    // Handle incoming websocket events
    const handleIncomingEvent = (event: any) => {
        if (event.type === "TOPIC_GENERATE") {
            toast.info("New debate topic generated!");
            setTopic(event.topic);
            setVotes({});
            return;
        }

        if (event.type === "TOPIC_VOTE") {
            setVotes(prev => ({ ...prev, [event.userId]: event.voteType }));
            return;
        }

        if (event.type === "DEBATE_STARTING") {
            setDebateStatus('starting');
            setCountdown(5);
            return;
        }

        setParticipants(prev => {
            switch (event.type) {
                case "JOIN":
                    if (event.id === currentUserId) return prev; // Ignore our own join echo

                    toast.info(`${event.name} has entered the room.`);

                    // Reply with a SYNC so they know who is already here & what the topic is
                    if (stompClientRef.current?.connected) {
                        stompClientRef.current.publish({
                            destination: `/topic/debate/${roomId}`,
                            body: JSON.stringify({
                                type: "SYNC",
                                participants: prev,
                                topic: topicRef.current,
                                votes: votesRef.current,
                                debateStatus: debateStatusRef.current
                            })
                        });
                    }

                    // Only add if not exist
                    if (!prev.find(p => p.id === event.id)) {
                        return [...prev, { id: event.id, name: event.name, role: prev.length === 0 ? "Moderator" : "Debater" }];
                    }
                    return prev;

                case "SYNC":
                    // Combine them and avoid duplicates
                    let updated = [...prev];
                    event.participants.forEach((p: Participant) => {
                        if (!updated.find(existing => existing.id === p.id)) {
                            updated.push(p);
                        }
                    });

                    const hasMod = updated.find(p => p.role === "Moderator");
                    if (hasMod && hasMod.id !== currentUserId) {
                        updated = updated.map(p => p.id === currentUserId ? { ...p, role: "Debater" } : p);
                    }

                    if (event.topic && !topicRef.current) {
                        setTopic(event.topic);
                        setVotes(event.votes || {});
                    }

                    if (event.debateStatus && debateStatusRef.current === 'lobby') {
                        setDebateStatus(event.debateStatus);
                    }

                    return updated;

                case "LEAVE":
                    if (event.id === currentUserId) return prev;
                    const peer = prev.find(p => p.id === event.id);
                    if (peer) {
                        toast.info(`${peer.name} has left the room.`);
                    }
                    return prev.filter(p => p.id !== event.id);

                default:
                    return prev;
            }
        });
    };

    const generateTopic = () => {
        const randomTopic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
        if (stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: `/topic/debate/${roomId}`,
                body: JSON.stringify({ type: "TOPIC_GENERATE", topic: randomTopic })
            });
        }
        setTopic(randomTopic);
        setVotes({});
    };

    const handleVote = (voteType: 'like' | 'dislike') => {
        if (!topic) return;

        setVotes(prev => ({ ...prev, [currentUserId]: voteType }));

        if (stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: `/topic/debate/${roomId}`,
                body: JSON.stringify({ type: "TOPIC_VOTE", userId: currentUserId, voteType })
            });
        }
    };

    // Auto regenerate or start debate based on votes
    useEffect(() => {
        if (participants.length >= 2 && topic && debateStatus === 'lobby') {
            const voteValues = Object.values(votes);
            // Wait for at least 2 votes
            if (voteValues.length >= 2) {
                const iAmMod = participants.find(p => p.id === currentUserId)?.role === 'Moderator';
                const likes = voteValues.filter(v => v === 'like').length;
                const dislikes = voteValues.filter(v => v === 'dislike').length;

                if (likes >= participants.length) { // Everyone agreed
                    if (iAmMod && stompClientRef.current?.connected) {
                        stompClientRef.current.publish({
                            destination: `/topic/debate/${roomId}`,
                            body: JSON.stringify({ type: "DEBATE_STARTING" })
                        });
                    }
                } else if (likes === dislikes && likes > 0) { // Tied up
                    if (iAmMod) {
                        toast.info("Tied up! Regenerating topic...");
                        setTimeout(() => generateTopic(), 2000);
                    } else {
                        toast.info("Votes tied! Waiting for new topic...");
                    }
                } else if (dislikes > likes) { // Majority dislike
                    if (iAmMod) {
                        toast.info("Majority vetoed the topic. Regenerating...");
                        setTimeout(() => generateTopic(), 1500);
                    }
                }
            }
        }
    }, [votes, participants.length, topic, debateStatus]);

    // Handle Countdown Timer
    useEffect(() => {
        if (debateStatus === 'starting') {
            if (countdown > 0) {
                const timerId = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timerId);
            } else {
                setDebateStatus('active');
            }
        }
    }, [debateStatus, countdown]);

    const copyRoomCode = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            setCopied(true);
            toast.success("Room code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLeaveRoom = () => {
        toast.info("Leaving debate room...");
        if (stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: `/topic/debate/${roomId}`,
                body: JSON.stringify({ type: "LEAVE", id: currentUserId })
            });
        }
        navigate("/arena/debate");
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            toast.success("Message sent to channel");
            setMessage("");
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Technical Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />

            <Navbar />

            <main className="flex-1 pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar: Participants */}
                <div className="lg:w-80 flex flex-col gap-6">
                    <Card className="glass-card border-white/5 p-6 flex flex-col h-fit">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                COMBATANTS
                            </h3>
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20">
                                {participants.length} LIVE
                            </span>
                        </div>

                        <div className="space-y-3">
                            {participants.map((p) => {
                                const isMe = p.id === currentUserId;
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isMe
                                            ? "bg-primary/10 border-primary/30 shadow-glow-blue"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10">
                                                {p.role === "Moderator" ? <Crown className="w-4 h-4 text-yellow-500" /> : <UserIcon className="w-4 h-4 text-muted-foreground" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-tight">{p.name} {isMe && "(You)"}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{p.role}</p>
                                            </div>
                                        </div>
                                        {isMe && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                    </div>
                                );
                            })}

                            {participants.length < 2 && (
                                <div className="p-4 border border-dashed border-white/10 rounded-xl text-center flex flex-col items-center opacity-50">
                                    <Users className="w-6 h-6 mb-2" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Waiting for opponents...</span>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            className="mt-8 text-destructive hover:bg-destructive/10 hover:text-destructive font-black text-[10px] uppercase tracking-widest gap-2"
                            onClick={handleLeaveRoom}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            ABANDON STAGE
                        </Button>
                    </Card>

                    <Card className="glass-card border-white/5 p-6 hidden lg:block">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Room Intel</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">Status</span>
                                <span className="text-[10px] text-green-500 font-bold uppercase flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-green-500" />
                                    Active
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">Topic Rules</span>
                                <span className="text-[10px] text-primary font-bold uppercase flex items-center gap-1">
                                    <Shield className="w-2.5 h-2.5" />
                                    2 Vetoes = Auto Skip
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Arena Content */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Room Info Header */}
                    <Card className="glass-card border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Mic2 className="w-5 h-5 text-primary" />
                                <h1 className="font-display text-2xl font-black uppercase tracking-tight">Arena Room</h1>
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                Topic: {topic ? <span className="text-white font-bold">{topic}</span> : "Waiting Generation..."}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4">
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">ROOM CODE</p>
                                    <p className="font-display text-lg font-black tracking-[0.2em] text-foreground">{roomId}</p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:bg-primary/20"
                                    onClick={copyRoomCode}
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <Button
                                className="btn-neon hidden sm:flex items-center gap-2 px-6"
                                onClick={copyRoomCode}
                            >
                                <Zap className="w-4 h-4 fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-widest">INVITE</span>
                            </Button>
                        </div>
                    </Card>

                    {/* Simulation Floor */}
                    <Card className="glass-card border-white/5 flex-1 relative min-h-[400px] overflow-hidden flex flex-col">
                        <div className="flex-1 flex flex-col items-center justify-center relative p-12 z-10">
                            {/* Visual Floor Decor */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05)_0%,transparent_70%)] -z-10" />

                            {debateStatus === 'active' ? (
                                <div className="text-center animate-in fade-in zoom-in-95 duration-500 w-full max-w-4xl">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/10 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Debate Live</span>
                                    </div>
                                    <h2 className="font-display text-2xl md:text-5xl font-black mb-8 uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                        {topic}
                                    </h2>
                                    <p className="text-muted-foreground font-medium max-w-lg mx-auto uppercase tracking-widest text-sm mb-12">
                                        The floor is open. Present your opening statement in the comms channel.
                                    </p>
                                </div>
                            ) : debateStatus === 'starting' ? (
                                <div className="text-center animate-in zoom-in duration-300">
                                    <h2 className="font-display text-6xl md:text-8xl font-black mb-4 uppercase text-primary drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                                        {countdown}
                                    </h2>
                                    <p className="text-sm font-black uppercase tracking-[0.3em] text-white animate-pulse">
                                        Commencing Clash Sequence
                                    </p>
                                </div>
                            ) : participants.length >= 2 ? (
                                topic ? (
                                    <div className="text-center max-w-2xl w-full animate-in fade-in zoom-in-95 duration-500">
                                        <h2 className="font-display text-2xl md:text-4xl font-black mb-8 uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                            {topic}
                                        </h2>

                                        <div className="flex flex-wrap items-center justify-center gap-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleVote('like')}
                                                className={`flex items-center gap-2 transition-all ${votes[currentUserId] === 'like' ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-white/10 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'}`}
                                            >
                                                <ThumbsUp className="w-4 h-4" />
                                                <span className="text-xs font-black uppercase tracking-widest">Agree</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() => handleVote('dislike')}
                                                className={`flex items-center gap-2 transition-all ${votes[currentUserId] === 'dislike' ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'}`}
                                            >
                                                <ThumbsDown className="w-4 h-4" />
                                                <span className="text-xs font-black uppercase tracking-widest">Veto</span>
                                            </Button>

                                            <div className="w-px h-8 bg-white/10 hidden sm:block" />

                                            <Button
                                                variant="outline"
                                                onClick={generateTopic}
                                                className="flex items-center gap-2 border-white/10 hover:bg-primary/20 hover:text-primary transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                <span className="text-xs font-black uppercase tracking-widest">Regenerate</span>
                                            </Button>
                                        </div>

                                        {Object.keys(votes).length > 0 && (
                                            <div className="mt-12 pt-8 border-t border-white/10 flex justify-center gap-12 animate-in slide-in-from-bottom-4 duration-300">
                                                <div className="text-center">
                                                    <p className="text-[10px] text-green-400/80 font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                                                        <ThumbsUp className="w-3 h-3" /> Agrees
                                                    </p>
                                                    <p className="font-display text-2xl font-black">{Object.values(votes).filter(v => v === 'like').length}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] text-red-400/80 font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                                                        <ThumbsDown className="w-3 h-3" /> Vetoes
                                                    </p>
                                                    <p className="font-display text-2xl font-black">{Object.values(votes).filter(v => v === 'dislike').length}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center animate-in fade-in duration-500">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                                            <Shield className="w-10 h-10 text-primary" />
                                        </div>
                                        <h2 className="font-display text-xl font-black uppercase tracking-[0.2em] mb-4">Combatants Ready</h2>
                                        <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest font-medium mb-8">
                                            The room is set with all participants. <br /> Generate a topic to begin the intellectual clash.
                                        </p>
                                        <Button onClick={generateTopic} className="btn-neon px-8 py-6 flex items-center gap-3">
                                            <Zap className="w-5 h-5 fill-current animate-pulse" />
                                            <span className="font-black uppercase tracking-widest">Generate Topic</span>
                                        </Button>
                                    </div>
                                )
                            ) : (
                                <div className="text-center opacity-70">
                                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                                        <Mic2 className="w-10 h-10 text-primary" />
                                    </div>
                                    <h2 className="font-display text-xl font-black uppercase tracking-[0.2em] mb-4">Stage is Prepping</h2>
                                    <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest font-medium">
                                        Waiting for an opponent to join the clash sequence. <br />
                                        You need at least 2 combatants to generate a topic.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bottom Utility Bar (Chat Placeholder) */}
                        <div className="p-4 bg-black/40 border-t border-white/5">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="TRANSMIT COORDINATES..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-wider focus:border-primary/50 outline-none transition-all placeholder:opacity-30"
                                    />
                                    <MessageSquare className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20" />
                                </div>
                                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/80 shrink-0">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DebateRoom;
