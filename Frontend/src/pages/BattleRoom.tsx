import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { Timer, Trophy, Play, Send, ChevronDown, MessageSquare, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import confetti from "canvas-confetti";

interface ChatMessage {
    senderId: string;
    senderName: string;
    text: string;
    time: string;
}

interface JudgeResult {
    status: string;
    runtime: string;
    memory: string;
    testCaseResults: {
        id: number;
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        errorMessage?: string;
    }[];
}

interface Problem {
    id: number;
    title: string;
    description: string;
    constraints: string;
    examples: string;
    boilerplates?: string; // JSON string: { javascript: "...", python: "...", java: "...", cpp: "..." }
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

const SUPPORTED_LANGUAGES = [
    { id: "javascript", name: "JavaScript", icon: "⚡" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "cpp", name: "C++", icon: "🚀" },
];

/** Fallback boilerplates shown while battle is loading or when DB has no entry for a language. */
const FALLBACK_BOILERPLATES: Record<string, string> = {
    javascript: "// Write your JavaScript solution here...",
    python: "# Write your Python solution here...",
    java: "import java.util.*;\n\npublic class Solution {\n    // Write your solution here\n\n    public static void main(String[] args) {\n        // I/O harness will be here\n    }\n}",
    cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}"
};

/** Parse the boilerplates JSON from the problem and return the code for the given language. */
const getBoilerplate = (problem: Problem | null, lang: string): string => {
    if (!problem?.boilerplates) return FALLBACK_BOILERPLATES[lang] ?? "";
    try {
        const map: Record<string, string> = JSON.parse(problem.boilerplates);
        return map[lang] ?? FALLBACK_BOILERPLATES[lang] ?? "";
    } catch {
        return FALLBACK_BOILERPLATES[lang] ?? "";
    }
};

const BattleRoom = () => {
    const { battleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [battle, setBattle] = useState<Battle | null>(null);
    const [code, setCode] = useState(FALLBACK_BOILERPLATES.javascript);
    const [language, setLanguage] = useState("javascript");
    const boilerplatesLoadedRef = useRef(false);
    const [timeLeft, setTimeLeft] = useState(1200);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunningLocally, setIsRunningLocally] = useState(false);
    const [opponentStatus, setOpponentStatus] = useState("WAITING...");
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const battleEndedRef = useRef(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);
    const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
    const [showVictoryScreen, setShowVictoryScreen] = useState(false);
    const [victoryReason, setVictoryReason] = useState<"ACCEPTED" | "OPPONENT_LEFT" | "">("");

    // Initial Fetch + polling until opponent joins
    useEffect(() => {
        let pollTimer: ReturnType<typeof setInterval> | null = null;

        const fetchBattle = async () => {
            try {
                const res = await fetch(`http://localhost:8081/api/arena/battle/${battleId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBattle(data);
                    // On first load, set the code to the DB boilerplate for the current language
                    if (!boilerplatesLoadedRef.current && data?.problem) {
                        boilerplatesLoadedRef.current = true;
                        setCode(getBoilerplate(data.problem, "javascript"));
                    }
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
                        setVictoryReason("OPPONENT_LEFT");
                        triggerVictoryConfetti();
                        setShowVictoryScreen(true);
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

                if (sub.resultJson) {
                    try {
                        const parsedResult = JSON.parse(sub.resultJson);
                        setJudgeResult(parsedResult);
                    } catch (e) {
                        console.error("Failed to parse resultJson", e);
                    }
                }

                if (sub.status === "PASSED") {
                    toast.success(`ACCEPTED! Runtime: ${sub.runtime}`);
                    setVictoryReason("ACCEPTED");
                    triggerVictoryConfetti();
                    setShowVictoryScreen(true);
                } else {
                    toast.error(`${sub.status}: Check console for details.`);
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

    const triggerVictoryConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                zIndex: 10000,
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                zIndex: 10000,
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    const handleRunLocally = async () => {
        if (!battle || !user || isRunningLocally) return;

        setIsRunningLocally(true);
        const loadingToast = toast.loading("Running code locally...");
        setJudgeResult(null);

        try {
            const response = await fetch("http://localhost:8081/api/submission/run", {
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
                const result = await response.json();
                toast.dismiss(loadingToast);
                setJudgeResult(result);

                if (result.status === "PASSED") {
                    toast.success("All test cases passed!");
                } else {
                    toast.error("Some test cases failed.");
                }
            } else {
                toast.dismiss(loadingToast);
                toast.error("Execution failed.");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Connection error.");
        } finally {
            setIsRunningLocally(false);
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

    const handleLanguageChange = (newLang: string) => {
        if (battle?.status === "COMPLETED") return;

        // Confirmation if code is not empty or just the current boilerplate
        const currentBoilerplate = getBoilerplate(battle?.problem ?? null, language);
        if (code.trim() !== "" && code.trim() !== currentBoilerplate.trim()) {
            if (!window.confirm("Changing language will replace your current code with the new boilerplate. Continue?")) {
                return;
            }
        }

        setLanguage(newLang);
        setCode(getBoilerplate(battle?.problem ?? null, newLang));
        toast.info(`Switched to ${SUPPORTED_LANGUAGES.find(l => l.id === newLang)?.name}`);
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
            {/* Battle Header */}
            <div className="pt-6 pb-4 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-10">
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
                {/* Result Overlay (Only for losers/draws now, Victory has its own screen) */}
                {battle.status === "COMPLETED" && !isWinner && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="glass-card p-12 border-white/10 text-center max-w-lg shadow-glow-neon">
                            <Trophy className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                            <h2 className="text-5xl font-display font-black mb-4 uppercase italic">
                                {isLoser ? "DEFEATED" : "BATTLE ENDED"}
                            </h2>
                            <p className="text-muted-foreground uppercase tracking-widest font-bold mb-8">
                                {isLoser ? "Better luck next time. Your rank remains same." : "Battle was ended automatically."}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => navigate("/arena/coding")} className="btn-neon px-8">Back to Arena</button>
                                <button onClick={() => window.location.reload()} className="btn-outline-neon px-8">Refresh</button>
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
                            <div className="relative group">
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="appearance-none bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 pr-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/10 hover:text-white transition-all outline-none cursor-pointer"
                                >
                                    {SUPPORTED_LANGUAGES.map(lang => (
                                        <option key={lang.id} value={lang.id} className="bg-[#0b0b0b]">{lang.icon} {lang.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/10 transition-colors">
                                Settings
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRunLocally}
                                disabled={isRunningLocally || isSubmitting || battle.status === "COMPLETED"}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                <Play className={`w-3.5 h-3.5 ${isRunningLocally ? 'animate-spin' : ''}`} />
                                {isRunningLocally ? "RUNNING..." : "Run Locally"}
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
                            {!judgeResult && (
                                <>
                                    <p className="mb-1 text-primary/60">{">"}  Initializing Battle Room Protocol...</p>
                                    <p className="mb-1 text-primary/60">{">"}  Connection established: OK</p>
                                    <p className="mb-1">{">"}  Ready for command execution.</p>
                                </>
                            )}

                            {isSubmitting && <p className="text-yellow-500 animate-pulse">{">"}  Processing submission: Running test cases in Docker container...</p>}
                            {isRunningLocally && <p className="text-primary animate-pulse">{">"}  Executing local run: Running test cases in Docker container...</p>}

                            {judgeResult && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 border-b border-white/5 pb-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${judgeResult.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {judgeResult.status}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Runtime: {judgeResult.runtime}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Memory: {judgeResult.memory}</span>
                                    </div>

                                    <div className="space-y-3">
                                        {judgeResult.testCaseResults.map((tc, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground/60">Test Case #{tc.id}</span>
                                                    <span className={`text-[10px] font-bold uppercase ${tc.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {tc.passed ? 'PASSED' : 'FAILED'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] uppercase text-muted-foreground/40 mb-1">Input</p>
                                                        <pre className="text-[10px] bg-black/40 p-2 rounded border border-white/5 overflow-x-auto">{tc.input || "No Input"}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] uppercase text-muted-foreground/40 mb-1">Output</p>
                                                        <pre className={`text-[10px] bg-black/40 p-2 rounded border border-white/5 overflow-x-auto ${tc.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {tc.actualOutput || "No Output"}
                                                        </pre>
                                                    </div>
                                                </div>
                                                {!tc.passed && (
                                                    <div className="mt-2 pt-2 border-t border-white/5">
                                                        <p className="text-[9px] uppercase text-muted-foreground/40 mb-1">Expected</p>
                                                        <pre className="text-[10px] text-emerald-500/80">{tc.expectedOutput}</pre>
                                                        {tc.errorMessage && (
                                                            <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                                                                <p className="text-[9px] text-red-400 font-bold uppercase">Error</p>
                                                                <p className="text-[10px] text-red-400/80">{tc.errorMessage}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

            {/* Victory Screen Overlay - Triggers when all tests pass or opponent leaves */}
            {showVictoryScreen && (
                <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500">
                    <div className="max-w-3xl w-full max-h-[90vh] flex flex-col bg-[#0b0b0b] border border-[#a25afd]/40 rounded-3xl shadow-[0_0_50px_rgba(162,90,253,0.3)] overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Header Banner */}
                        <div className="shrink-0 bg-gradient-to-r from-[#26ccff]/20 via-[#a25afd]/20 to-[#ff36ff]/20 p-6 md:p-8 text-center border-b border-[#a25afd]/30 relative">
                            <div className="inline-flex items-center justify-center p-4 bg-[#a25afd]/20 rounded-full mb-6">
                                <Trophy className="w-12 h-12 text-[#a25afd] drop-shadow-[0_0_15px_rgba(162,90,253,0.8)]" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-[#ff5e7e] via-[#ffa62d] to-[#fcff42] animate-pulse">
                                VICTORY!
                            </h2>
                            <p className="mt-4 text-emerald-400 font-bold uppercase tracking-[0.2em]">
                                {victoryReason === "OPPONENT_LEFT" ? "Opponent Fled The Arena!" : "Solution Accepted! All Test Cases Passed"}
                            </p>
                            <p className="mt-2 text-[#ff36ff] font-bold uppercase tracking-[0.1em] text-[10px]">
                                {victoryReason === "OPPONENT_LEFT" ? "Default Victory. +25 XP earned." : "You dominated the arena. +50 XP earned."}
                            </p>
                        </div>

                        {victoryReason === "ACCEPTED" && judgeResult && (
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
                                    <div className="bg-black/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                                        <Timer className="w-6 h-6 text-[#26ccff] mb-2" />
                                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Runtime</span>
                                        <span className="text-xl font-black text-white">{judgeResult.runtime}</span>
                                    </div>
                                    <div className="bg-black/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                                        <Zap className="w-6 h-6 text-[#ff36ff] mb-2" />
                                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Memory Use</span>
                                        <span className="text-xl font-black text-white">{judgeResult.memory}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] uppercase font-black text-white/40 tracking-widest pl-2 mb-2 block">
                                        Your Winning Code ({SUPPORTED_LANGUAGES.find(l => l.id === language)?.name})
                                    </span>
                                    <div className="bg-black/80 border border-white/10 rounded-xl overflow-auto p-4 custom-scrollbar relative">
                                        {/* Subtle glow behind code */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#a25afd]/5 to-transparent pointer-events-none" />
                                        <pre className="text-xs font-mono text-emerald-400/90 leading-relaxed whitespace-pre-wrap">
                                            {code}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fixed Actions Footer */}
                        <div className="shrink-0 p-6 bg-black/60 backdrop-blur-md border-t border-white/5">
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate("/arena/coding")}
                                    className="px-6 md:px-8 py-3 bg-[#0b0b0b] border border-[#26ccff]/40 text-white font-black uppercase tracking-widest rounded-xl hover:bg-[#26ccff]/10 hover:border-[#26ccff] transition-all"
                                >
                                    Exit Arena
                                </button>
                                <button
                                    onClick={() => navigate("/arena/coding", { state: { autoMatchmake: true } })}
                                    className="px-6 md:px-8 py-3 bg-gradient-to-r from-[#a25afd] to-[#ff36ff] text-white font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(162,90,253,0.5)] transition-all transform hover:-translate-y-1"
                                >
                                    Rematch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BattleRoom;
