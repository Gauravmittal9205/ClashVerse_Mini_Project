import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import {
    type User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    type AuthError,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../lib/firebase";

// ─── Backend URL ───────────────────────────────────────────────────────────────
const BACKEND_URL = "http://localhost:8080";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithGitHub: () => Promise<void>;
    logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Sync helper ──────────────────────────────────────────────────────────────

/**
 * After every Firebase login, fetch an ID token and POST it to the Spring Boot
 * backend which verifies it server-side and upserts the user into PostgreSQL.
 */
async function syncWithBackend(user: User): Promise<void> {
    try {
        const idToken = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/auth/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        });
        if (!res.ok) {
            const msg = await res.text();
            console.warn("[AuthContext] Backend sync failed:", msg);
        } else {
            const data = await res.json();
            console.info("[AuthContext] User synced to PostgreSQL:", data);
        }
    } catch (err) {
        // Backend may not be running in dev — don't block the UI
        console.warn("[AuthContext] Could not reach backend:", err);
    }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen to Firebase auth state — also sync to DB on every login
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
            if (firebaseUser) {
                // Fire-and-forget backend sync (doesn't block UI)
                syncWithBackend(firebaseUser);
            }
        });
        return unsubscribe;
    }, []);

    // ── Email / Password Login ─────────────────────────────────────────────────
    const loginWithEmail = async (email: string, password: string) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await syncWithBackend(credential.user);
    };

    // ── Email / Password Register ──────────────────────────────────────────────
    const registerWithEmail = async (
        username: string,
        email: string,
        password: string
    ) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        // Save display name on Firebase
        await updateProfile(credential.user, { displayName: username });
        // Refresh local user so displayName is visible immediately
        setUser({ ...credential.user, displayName: username } as User);
        // Sync to backend (getIdToken will include the updated profile)
        await syncWithBackend(credential.user);
    };

    // ── Google Sign-In ─────────────────────────────────────────────────────────
    const loginWithGoogle = async () => {
        const credential = await signInWithPopup(auth, googleProvider);
        await syncWithBackend(credential.user);
    };

    // ── GitHub Sign-In ─────────────────────────────────────────────────────────
    const loginWithGitHub = async () => {
        const credential = await signInWithPopup(auth, githubProvider);
        await syncWithBackend(credential.user);
    };

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                loginWithEmail,
                registerWithEmail,
                loginWithGoogle,
                loginWithGitHub,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
};

// ─── Firebase error → readable message ────────────────────────────────────────

export const firebaseErrorMessage = (error: unknown): string => {
    const code = (error as AuthError)?.code ?? "";
    const map: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/popup-closed-by-user": "Sign-in popup was closed.",
        "auth/account-exists-with-different-credential":
            "An account already exists with this email using a different sign-in method.",
        "auth/cancelled-popup-request": "Only one popup request is allowed at a time.",
        "auth/network-request-failed": "Network error. Please check your connection.",
    };
    return map[code] ?? "Something went wrong. Please try again.";
};
