import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Editor } from "@monaco-editor/react";
import { Timer, Trophy, Play, Send, ChevronDown, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

interface ChatMessage {
    senderId: string;
    senderName: string;
    text: string;
    time: string;
}

interface Problem {
    id: number;
    title: string;
    description: string;
    constraints: string;
    examples: string;
}

interface Battle {
    id: number;
    problem: Problem;
    player1: { firebaseUid: string; displayName: string };
    player2?: { firebaseUid: string; displayName: string };
    status: string;
    startTime: string;
    winnerId?: string;
}

const BattleRoom = () => {
    const { battleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [battle, setBattle] = useState<Battle | null>(null);
    const [code, setCode] = useState("// Write your solution here...");
    const [language] = useState("javascript");
    const [timeLeft, setTimeLeft] = useState(1200);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [opponentStatus, setOpponentStatus] = useState("WAITING...");
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const battleEndedRef = useRef(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);

    // Initial Fetch + polling until opponent joins
    useEffect(() => {
        let pollTimer: ReturnType<typeof setInterval> | null = null;

        const fetchBattle = async () => {
            try {
                const res = await fetch(`http://localhost:8081/api/arena/battle/${battleId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBattle(data);
                    if (data.status === "COMPLETED") {
                        toast.info("Battle is already completed.");
                        if (pollTimer) clearInterval(pollTimer);
                    }
                    // If no opponent yet, start polling
                    if (data.status === "WAITING" && !pollTimer) {
                        pollTimer = setInterval(async () => {
                            try {
                                const pollRes = await fetch(`http://localhost:8081/api/arena/battle/${battleId}`);
                                if (pollRes.ok) {
                                    const pollData = await pollRes.json();
                                    if (pollData.status === "ACTIVE" && pollData.player2) {
                                        setBattle(pollData);
                                        setOpponentStatus("READY");
                                        toast.success(`${pollData.player2.displayName} joined the battle!`);
                                        if (pollTimer) clearInterval(pollTimer);
                                    }
                                }
                            } catch (_) { }
                        }, 2000);
                    }
                } else {
                    toast.error("Battle not found.");
                    navigate("/arena/coding");
                }
            } catch (err) {
                toast.error("Failed to fetch battle details.");
            }
        };

        fetchBattle();

        return () => {
            if (pollTimer) clearInterval(pollTimer);
        };
    }, [battleId, navigate]);

    // WebSocket Setup
    useEffect(() => {
        const socket = new SockJS("http://localhost:8081/ws-arena");
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("Connected to WebSocket");
                client.subscribe(`/topic/battle/${battleId}`, (message) => {
                    const event = JSON.parse(message.body);
                    handleBattleEvent(event);
                });
            },
            onStompError: (frame) => {
                console.error("Broker reported error: " + frame.headers["message"]);
            },
        });

        client.activate();
        setStompClient(client);
        stompClientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [battleId]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Forfeit on leave: send fire-and-forget forfeit request
    useEffect(() => {
        const sendForfeit = () => {
            if (!battle || !user || battle.status !== "ACTIVE" || battleEndedRef.current) return;
            navigator.sendBeacon(
                `http://localhost:8081/api/arena/forfeit?battleId=${battle.id}&firebaseUid=${user.uid}`
            );
        };

        window.addEventListener("beforeunload", sendForfeit);
        return () => {
            sendForfeit();
            window.removeEventListener("beforeunload", sendForfeit);
        };
    }, [battle, user]);

    const handleBattleEvent = (event: any) => {
        switch (event.type) {
            case "PLAYER_JOINED":
                toast.success(event.payload);
                // Refresh battle data to get player2 info
                window.location.reload();
                break;
            case "CHAT":
                setChatMessages(prev => [...prev, {
                    senderId: event.senderId,
                    senderName: event.payload.split("||")?.[0] || "Unknown",
                    text: event.payload.split("||")?.[1] || event.payload,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                break;
            case "SUBMITTED":
                if (event.senderId !== user?.uid) {
                    setOpponentStatus(event.payload === "PASSED" ? "SUBMITTED (PASSED!)" : "FAILED ATTEMPT");
                    if (event.payload === "PASSED") {
                        toast.warning("Opponent has passed the test cases!");
                    }
                }
                break;
            case "BATTLE_END":
                battleEndedRef.current = true; // mark so forfeit doesn't double-fire
                setBattle(prev => prev ? { ...prev, status: "COMPLETED", winnerId: event.senderId } : null);
                if (event.senderId === user?.uid) {
                    if (event.payload === "Opponent left. You win!") {
                        toast.success("🏆 Opponent forfeited! YOU WIN!");
                    } else {
                        toast.success("YOU WON! 🏆");
                    }
                } else {
                    if (event.payload === "Opponent left. You win!") {
                        toast.error("You forfeited the battle. 🏁");
                    } else {
                        toast.error("BATTLE OVER: Opponent Won! 🏁");
                    }
                }
                break;
            case "TYPING":
                if (event.senderId !== user?.uid) {
                    setOpponentStatus("TYPING...");
                    setTimeout(() => setOpponentStatus("READY"), 3000);
                }
                break;
        }
    };

    // Timer logic
    useEffect(() => {
        if (!battle || battle.status !== "ACTIVE" || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [battle, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (!battle || !user || isSubmitting) return;

        setIsSubmitting(true);
        const loadingToast = toast.loading("Executing test cases...");

        try {
            const response = await fetch("http://localhost:8081/api/submission", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    battleId: battle.id,
                    firebaseUid: user.uid,
                    code,
                    language
                })
            });

            if (response.ok) {
                const sub = await response.json();
                toast.dismiss(loadingToast);
                if (sub.status === "PASSED") {
                    toast.success(`ACCEPTED! Runtime: ${sub.runtime}`);
                } else {
                    toast.error("WRONG ANSWER: Check your logic.");
                }
            } else {
                toast.dismiss(loadingToast);
                toast.error("Submission failed.");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Connection error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCodeChange = (value: string | undefined) => {
        setCode(value || "");
        if (stompClientRef.current?.connected && user) {
            stompClientRef.current.publish({
                destination: `/app/battle/${battleId}/action`,
                body: JSON.stringify({ type: "TYPING", senderId: user.uid, payload: "" })
            });
        }
    };

    const handleSendChat = () => {
        if (!chatInput.trim() || !stompClientRef.current?.connected || !user || !battle) return;
        const senderName = battle.player1.firebaseUid === user.uid
            ? battle.player1.displayName
            : battle.player2?.displayName || "You";
        stompClientRef.current.publish({
            destination: `/app/battle/${battleId}/action`,
            body: JSON.stringify({
                type: "CHAT",
                senderId: user.uid,
                payload: `${senderName}||${chatInput.trim()}`
            })
        });
        setChatInput("");
    };

    if (!battle) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-primary font-mono animate-pulse uppercase tracking-[0.3em]">Synching Neural Link...</p>
                </div>
            </div>
        );
    }

    const isWinner = battle.winnerId === user?.uid;
    const isLoser = battle.winnerId && battle.winnerId !== user?.uid;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Battle Header */}
            <div className="pt-24 pb-4 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-10">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${battle.status === 'COMPLETED' ? 'bg-yellow-500/10' : 'bg-primary/10'}`}>
                                <Trophy className={`w-5 h-5 ${battle.status === 'COMPLETED' ? 'text-yellow-500' : 'text-primary'}`} />
                            </div>
                            <div>
                                <h1 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{battle.status}</h1>
                                <p className="text-lg font-display font-black text-white">#BATTLE-{battleId}</p>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-white/10" />

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-primary">
                                    {battle.player1.firebaseUid === user?.uid ? battle.player1.displayName : battle.player2?.displayName || "Player"} (YOU)
                                </p>
                                <p className="text-xs font-bold text-neon-blue uppercase">ACTIVE</p>
                            </div>
                            <div className="text-xl font-display font-black text-muted-foreground/20">VS</div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase text-muted-foreground">
                                    {battle.player1.firebaseUid === user?.uid
                                        ? (battle.player2?.displayName || battle.player2?.firebaseUid?.substring(0, 8) || "Opponent")
                                        : (battle.player1.displayName || battle.player1.firebaseUid?.substring(0, 8) || "Opponent")}
                                </p>
                                <p className={`text-xs font-bold uppercase ${opponentStatus === 'TYPING...' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
                                    {battle.status === 'WAITING' ? "WAITING..." : opponentStatus === 'WAITING...' ? 'READY' : opponentStatus}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Combat Clock</span>
                            <div className={`flex items-center gap-2 text-2xl font-display font-black tabular-nums ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                <Timer className="w-5 h-5" />
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || battle.status === "COMPLETED"}
                            className={`btn-neon px-8 py-3 flex items-center gap-2 text-sm disabled:opacity-50 disabled:grayscale transition-all ${battle.status === 'COMPLETED' ? 'opacity-50' : ''}`}
                        >
                            <Send className={`w-4 h-4 ${isSubmitting ? 'animate-bounce' : ''}`} />
                            {isSubmitting ? "JUDGING..." : "SUBMIT CODE"}
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex overflow-hidden relative">
                {/* Result Overlay */}
                {battle.status === "COMPLETED" && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="glass-card p-12 border-white/10 text-center max-w-lg shadow-glow-neon">
                            <Trophy className={`w-20 h-20 mx-auto mb-6 ${isWinner ? 'text-yellow-500 shadow-glow-yellow' : 'text-muted-foreground'}`} />
                            <h2 className="text-5xl font-display font-black mb-4 uppercase italic">
                                {isWinner ? "VICTORY" : isLoser ? "DEFEATED" : "BATTLE ENDED"}
                            </h2>
                            <p className="text-muted-foreground uppercase tracking-widest font-bold mb-8">
                                {isWinner ? "You dominated the arena. +50 XP earned." : "Better luck next time. Your rank remains same."}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => navigate("/arena/coding")} className="btn-neon px-8">Back to Arena</button>
                                <button onClick={() => window.location.reload()} className="btn-outline-neon px-8">View Results</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Left Panel: Problem Statement */}
                <div className="w-1/3 border-r border-white/5 bg-black/20 flex flex-col shrink-0 overflow-y-auto">
                    <div className="p-8 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Protocol.Objective</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase">Medium</span>
                            </div>
                            <h2 className="text-2xl font-display font-black uppercase mb-4 tracking-tight">{battle.problem.title}</h2>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-muted-foreground leading-relaxed font-body">
                                    {battle.problem.description}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2 block">Technical Constraints</span>
                                <div className="font-mono text-xs text-muted-foreground whitespace-pre-line leading-loose">
                                    {battle.problem.constraints}
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-3 block">Execution Examples</span>
                            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-primary/80 whitespace-pre-line border-l-4 border-l-primary">
                                {battle.problem.examples}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Editor & Controls */}
                <div className="flex-1 flex flex-col bg-[#0b0b0b] min-w-0">
                    {/* Editor Toolbar */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 group">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{language}</span>
                            </div>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/10 transition-colors">
                                Settings <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/10 transition-all">
                                <Play className="w-3.5 h-3.5" />
                                Run Locally
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={handleCodeChange}
                            options={{
                                fontSize: 15,
                                fontFamily: "'JetBrains Mono', monospace",
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 24, bottom: 24 },
                                lineNumbers: 'on',
                                roundedSelection: true,
                                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                                overviewRulerBorder: false,
                                hideCursorInOverviewRuler: true,
                                renderLineHighlight: 'all',
                                cursorBlinking: 'smooth',
                                cursorStyle: 'line',
                                fontWeight: '500'
                            }}
                        />
                    </div>

                    {/* Editor Footer / Console Output */}
                    <div className="h-48 border-t border-white/5 bg-black/60 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Neural Engine Diagnostics
                            </span>
                            <span className="text-[9px] font-bold text-primary/40 uppercase">Latency: 12ms</span>
                        </div>
                        <div className="flex-1 font-mono text-xs text-muted-foreground/40 bg-black/40 rounded-xl p-4 border border-white/5 overflow-y-auto">
                            <p className="mb-1 text-primary/60">{">"}  Initializing Battle Room Protocol...</p>
                            <p className="mb-1 text-primary/60">{">"}  Connection established: OK</p>
                            <p className="mb-1">{">"}  Ready for command execution.</p>
                            {isSubmitting && <p className="text-yellow-500 animate-pulse">{">"}  Processing submission: Running 12/12 test cases...</p>}
                        </div>
                    </div>
                </div>

                {/* Chat Panel */}
                <div className={`flex flex-col border-l border-white/5 bg-black/30 backdrop-blur-sm transition-all duration-300 ${isChatOpen ? 'w-72' : 'w-12'}`}>
                    {/* Chat Header */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                        {isChatOpen && (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Chat</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsChatOpen(o => !o)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors ml-auto"
                        >
                            {isChatOpen ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        </button>
                    </div>

                    {isChatOpen && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {chatMessages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
                                        <MessageSquare className="w-8 h-8 text-primary" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">No messages yet.<br />Say hi to opponent!</p>
                                    </div>
                                )}
                                {chatMessages.map((msg, i) => {
                                    const isMe = msg.senderId === user?.uid;
                                    return (
                                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1 px-1">
                                                {isMe ? 'You' : msg.senderName} · {msg.time}
                                            </span>
                                            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed break-words ${isMe
                                                ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-sm'
                                                : 'bg-white/5 border border-white/10 text-muted-foreground rounded-tl-sm'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t border-white/5 shrink-0">
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-primary/40 transition-colors">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                                        placeholder="Type a message..."
                                        maxLength={200}
                                        className="flex-1 bg-transparent text-xs text-white placeholder:text-muted-foreground/40 outline-none font-mono"
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        disabled={!chatInput.trim()}
                                        className="text-primary hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-[9px] text-muted-foreground/30 mt-1.5 text-right">{chatInput.length}/200</p>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BattleRoom;
