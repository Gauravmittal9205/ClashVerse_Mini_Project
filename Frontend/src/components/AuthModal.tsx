import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    LogIn,
    UserPlus,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Zap,
    Shield,
    ArrowRight,
    Github,
    Chrome,
    AlertCircle,
} from "lucide-react";
import { useAuth, firebaseErrorMessage } from "../contexts/AuthContext";

interface AuthModalProps {
    isOpen: boolean;
    initialTab?: "login" | "register";
    onClose: () => void;
    onLoginSuccess: () => void;
}

const AuthModal = ({
    isOpen,
    initialTab = "login",
    onClose,
    onLoginSuccess,
}: AuthModalProps) => {
    const { loginWithEmail, registerWithEmail, loginWithGoogle, loginWithGitHub } =
        useAuth();

    const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Login form state
    const [loginData, setLoginData] = useState({ email: "", password: "" });

    // Register form state
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const switchTab = (tab: "login" | "register") => {
        setActiveTab(tab);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setError(null);
    };

    // ── Login handler ──────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await loginWithEmail(loginData.email, loginData.password);
            onLoginSuccess();
            onClose();
        } catch (err) {
            setError(firebaseErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    // ── Register handler ───────────────────────────────────────────────────────
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await registerWithEmail(
                registerData.username,
                registerData.email,
                registerData.password
            );
            onLoginSuccess();
            onClose();
        } catch (err) {
            setError(firebaseErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    // ── Social handlers ────────────────────────────────────────────────────────
    const handleGoogle = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await loginWithGoogle();
            onLoginSuccess();
            onClose();
        } catch (err) {
            setError(firebaseErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHub = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await loginWithGitHub();
            onLoginSuccess();
            onClose();
        } catch (err) {
            setError(firebaseErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Shared input style helpers
    const inputBase: React.CSSProperties = {
        background: "hsl(240 25% 10%)",
        border: "1px solid hsl(240 20% 22%)",
        fontFamily: "'Inter', sans-serif",
    };
    const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = "hsl(270 100% 65% / 0.5)";
        e.target.style.boxShadow = "0 0 0 2px hsl(270 100% 65% / 0.1)";
    };
    const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = "hsl(240 20% 22%)";
        e.target.style.boxShadow = "none";
    };
    const labelStyle: React.CSSProperties = {
        color: "hsl(220 15% 55%)",
        fontFamily: "'Rajdhani', sans-serif",
    };
    const submitBtnStyle: React.CSSProperties = {
        fontFamily: "'Rajdhani', sans-serif",
        background: "linear-gradient(135deg, hsl(270 100% 65%), hsl(220 100% 60%))",
        boxShadow: "0 0 20px hsl(270 100% 65% / 0.3)",
        letterSpacing: "0.08em",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="auth-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: "rgba(10, 8, 26, 0.85)", backdropFilter: "blur(8px)" }}
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        key="auth-modal"
                        initial={{ opacity: 0, scale: 0.88, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 30 }}
                        transition={{ type: "spring", damping: 22, stiffness: 260 }}
                        className="relative w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Ambient glow */}
                        <div
                            className="absolute -inset-px rounded-2xl pointer-events-none"
                            style={{
                                background:
                                    "linear-gradient(135deg, hsl(270 100% 65% / 0.25), hsl(220 100% 60% / 0.15))",
                                filter: "blur(1px)",
                            }}
                        />

                        {/* Card */}
                        <div
                            className="relative rounded-2xl overflow-hidden border border-white/10"
                            style={{
                                background:
                                    "linear-gradient(145deg, hsl(240 25% 12% / 0.95), hsl(240 29% 8% / 0.98))",
                                boxShadow:
                                    "0 0 40px hsl(270 100% 65% / 0.15), 0 0 80px hsl(220 100% 60% / 0.08), inset 0 1px 0 hsl(255 100% 80% / 0.08)",
                            }}
                        >
                            {/* Top gradient bar */}
                            <div
                                className="h-1 w-full"
                                style={{
                                    background:
                                        "linear-gradient(90deg, hsl(270 100% 65%), hsl(220 100% 60%), hsl(185 100% 55%))",
                                }}
                            />

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg" style={{ background: "hsl(270 100% 65% / 0.15)" }}>
                                        <Zap className="w-4 h-4" style={{ color: "hsl(270 100% 65%)" }} />
                                    </div>
                                    <span
                                        className="font-bold text-lg tracking-tight"
                                        style={{
                                            fontFamily: "'Rajdhani', sans-serif",
                                            background: "linear-gradient(135deg, hsl(270 100% 65%), hsl(220 100% 60%))",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        ClashVerse
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Tab switcher */}
                            <div className="px-6 pb-2">
                                <div className="flex rounded-xl p-1" style={{ background: "hsl(240 25% 10%)" }}>
                                    {(["login", "register"] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => switchTab(tab)}
                                            className="relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 capitalize tracking-wide"
                                            style={{
                                                fontFamily: "'Rajdhani', sans-serif",
                                                color: activeTab === tab ? "white" : "hsl(220 15% 55%)",
                                            }}
                                        >
                                            {activeTab === tab && (
                                                <motion.div
                                                    layoutId="auth-tab-bg"
                                                    className="absolute inset-0 rounded-lg"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, hsl(270 100% 65% / 0.25), hsl(220 100% 60% / 0.15))",
                                                        boxShadow: "0 0 12px hsl(270 100% 65% / 0.2)",
                                                    }}
                                                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center justify-center gap-1.5">
                                                {tab === "login" ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                                                {tab === "login" ? "Login" : "Register"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Form area */}
                            <div className="px-6 pb-6 pt-2">
                                {/* ── Error Banner ── */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: "auto" }}
                                            exit={{ opacity: 0, y: -8, height: 0 }}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-3 text-sm"
                                            style={{
                                                background: "hsl(0 84% 60% / 0.1)",
                                                border: "1px solid hsl(0 84% 60% / 0.3)",
                                                color: "hsl(0 84% 70%)",
                                                fontFamily: "'Inter', sans-serif",
                                            }}
                                        >
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence mode="wait">
                                    {/* ════════════════ LOGIN FORM ════════════════ */}
                                    {activeTab === "login" ? (
                                        <motion.form
                                            key="login-form"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={handleLogin}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="mb-1">
                                                <h2
                                                    className="text-xl font-bold text-white"
                                                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.1rem" }}
                                                >
                                                    Welcome Back
                                                </h2>
                                                <p className="text-xs mt-1" style={{ color: "hsl(220 15% 55%)" }}>
                                                    Enter the arena. Your rivals await.
                                                </p>
                                            </div>

                                            {/* Email */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-widest" style={labelStyle}>
                                                    Email
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(270 100% 65% / 0.6)" }} />
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="commander@clashverse.gg"
                                                        value={loginData.email}
                                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                                                        style={inputBase}
                                                        onFocus={onFocusInput}
                                                        onBlur={onBlurInput}
                                                    />
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-semibold uppercase tracking-widest" style={labelStyle}>
                                                        Password
                                                    </label>
                                                    <a href="#" className="text-xs transition-colors hover:underline" style={{ color: "hsl(270 100% 65%)", fontFamily: "'Inter', sans-serif" }}>
                                                        Forgot password?
                                                    </a>
                                                </div>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(270 100% 65% / 0.6)" }} />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        required
                                                        placeholder="••••••••"
                                                        value={loginData.password}
                                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                                                        style={inputBase}
                                                        onFocus={onFocusInput}
                                                        onBlur={onBlurInput}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                                        style={{ color: "hsl(220 15% 55%)" }}
                                                        tabIndex={-1}
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="relative w-full py-3 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300 flex items-center justify-center gap-2 mt-1 group disabled:opacity-60 disabled:cursor-not-allowed"
                                                style={submitBtnStyle}
                                                onMouseEnter={(e) => {
                                                    if (!isLoading) {
                                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 35px hsl(270 100% 65% / 0.55), 0 0 70px hsl(270 100% 65% / 0.2)";
                                                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px hsl(270 100% 65% / 0.3)";
                                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                                }}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                        />
                                                        Authenticating…
                                                    </span>
                                                ) : (
                                                    <>
                                                        <LogIn className="w-4 h-4" />
                                                        ENTER ARENA
                                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                    </>
                                                )}
                                            </button>

                                            {/* Divider */}
                                            <div className="flex items-center gap-3 my-1">
                                                <div className="flex-1 h-px" style={{ background: "hsl(240 20% 22%)" }} />
                                                <span className="text-xs" style={{ color: "hsl(220 15% 45%)", fontFamily: "'Inter', sans-serif" }}>
                                                    or continue with
                                                </span>
                                                <div className="flex-1 h-px" style={{ background: "hsl(240 20% 22%)" }} />
                                            </div>

                                            {/* Social buttons */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleGitHub}
                                                    disabled={isLoading}
                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
                                                    style={{ background: "hsl(240 25% 10%)", border: "1px solid hsl(240 20% 22%)", color: "hsl(220 20% 75%)", fontFamily: "'Rajdhani', sans-serif" }}
                                                >
                                                    <Github className="w-4 h-4" />
                                                    GitHub
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleGoogle}
                                                    disabled={isLoading}
                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
                                                    style={{ background: "hsl(240 25% 10%)", border: "1px solid hsl(240 20% 22%)", color: "hsl(220 20% 75%)", fontFamily: "'Rajdhani', sans-serif" }}
                                                >
                                                    <Chrome className="w-4 h-4" />
                                                    Google
                                                </button>
                                            </div>

                                            <p className="text-center text-xs mt-1" style={{ color: "hsl(220 15% 45%)", fontFamily: "'Inter', sans-serif" }}>
                                                No account?{" "}
                                                <button type="button" onClick={() => switchTab("register")} className="font-semibold hover:underline transition-colors" style={{ color: "hsl(270 100% 65%)" }}>
                                                    Join ClashVerse
                                                </button>
                                            </p>
                                        </motion.form>
                                    ) : (
                                        /* ════════════════ REGISTER FORM ════════════════ */
                                        <motion.form
                                            key="register-form"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={handleRegister}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="mb-1">
                                                <h2
                                                    className="text-xl font-bold text-white"
                                                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.1rem" }}
                                                >
                                                    Create Account
                                                </h2>
                                                <p className="text-xs mt-1" style={{ color: "hsl(220 15% 55%)" }}>
                                                    Rise through the ranks. Begin your legend.
                                                </p>
                                            </div>

                                            {/* Username */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-widest" style={labelStyle}>
                                                    Username
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(270 100% 65% / 0.6)" }} />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="CommanderX"
                                                        value={registerData.username}
                                                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                                                        style={inputBase}
                                                        onFocus={onFocusInput}
                                                        onBlur={onBlurInput}
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-widest" style={labelStyle}>
                                                    Email
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(270 100% 65% / 0.6)" }} />
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="commander@clashverse.gg"
                                                        value={registerData.email}
                                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                                                        style={inputBase}
                                                        onFocus={onFocusInput}
                                                        onBlur={onBlurInput}
                                                    />
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-widest" style={labelStyle}>
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(270 100% 65% / 0.6)" }} />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        required
                                                        minLength={6}
                                                        placeholder="Min. 6 characters"
                                                        value={registerData.password}
                                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                                                        style={inputBase}
                                                        onFocus={onFocusInput}
                                                        onBlur={onBlurInput}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                                        style={{ color: "hsl(220 15% 55%)" }}
                                                        tabIndex={-1}
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-widest" style={labelStyle}>
                                                    Confirm Password
                                                </label>
                                                <div className="relative">
                                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(270 100% 65% / 0.6)" }} />
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        required
                                                        placeholder="Repeat password"
                                                        value={registerData.confirmPassword}
                                                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                                        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                                                        style={{
                                                            ...inputBase,
                                                            border:
                                                                registerData.confirmPassword &&
                                                                    registerData.password !== registerData.confirmPassword
                                                                    ? "1px solid hsl(0 84% 60% / 0.7)"
                                                                    : "1px solid hsl(240 20% 22%)",
                                                        }}
                                                        onFocus={onFocusInput}
                                                        onBlur={onBlurInput}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                                        style={{ color: "hsl(220 15% 55%)" }}
                                                        tabIndex={-1}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {registerData.confirmPassword &&
                                                    registerData.password !== registerData.confirmPassword && (
                                                        <p className="text-xs" style={{ color: "hsl(0 84% 60%)", fontFamily: "'Inter', sans-serif" }}>
                                                            Passwords do not match
                                                        </p>
                                                    )}
                                            </div>

                                            {/* Terms */}
                                            <p className="text-xs leading-relaxed" style={{ color: "hsl(220 15% 45%)", fontFamily: "'Inter', sans-serif" }}>
                                                By registering you agree to our{" "}
                                                <a href="#" className="hover:underline" style={{ color: "hsl(270 100% 65%)" }}>Terms of Service</a>{" "}
                                                and{" "}
                                                <a href="#" className="hover:underline" style={{ color: "hsl(270 100% 65%)" }}>Privacy Policy</a>.
                                            </p>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={
                                                    isLoading ||
                                                    (!!registerData.confirmPassword &&
                                                        registerData.password !== registerData.confirmPassword)
                                                }
                                                className="relative w-full py-3 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={submitBtnStyle}
                                                onMouseEnter={(e) => {
                                                    if (!isLoading) {
                                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 35px hsl(270 100% 65% / 0.55), 0 0 70px hsl(270 100% 65% / 0.2)";
                                                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px hsl(270 100% 65% / 0.3)";
                                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                                }}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                        />
                                                        Creating account…
                                                    </span>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4" />
                                                        JOIN CLASHVERSE
                                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                    </>
                                                )}
                                            </button>

                                            {/* Social sign-up */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-px" style={{ background: "hsl(240 20% 22%)" }} />
                                                <span className="text-xs" style={{ color: "hsl(220 15% 45%)", fontFamily: "'Inter', sans-serif" }}>or sign up with</span>
                                                <div className="flex-1 h-px" style={{ background: "hsl(240 20% 22%)" }} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleGitHub}
                                                    disabled={isLoading}
                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
                                                    style={{ background: "hsl(240 25% 10%)", border: "1px solid hsl(240 20% 22%)", color: "hsl(220 20% 75%)", fontFamily: "'Rajdhani', sans-serif" }}
                                                >
                                                    <Github className="w-4 h-4" />
                                                    GitHub
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleGoogle}
                                                    disabled={isLoading}
                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
                                                    style={{ background: "hsl(240 25% 10%)", border: "1px solid hsl(240 20% 22%)", color: "hsl(220 20% 75%)", fontFamily: "'Rajdhani', sans-serif" }}
                                                >
                                                    <Chrome className="w-4 h-4" />
                                                    Google
                                                </button>
                                            </div>

                                            <p className="text-center text-xs" style={{ color: "hsl(220 15% 45%)", fontFamily: "'Inter', sans-serif" }}>
                                                Already a warrior?{" "}
                                                <button type="button" onClick={() => switchTab("login")} className="font-semibold hover:underline" style={{ color: "hsl(270 100% 65%)" }}>
                                                    Log in
                                                </button>
                                            </p>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
