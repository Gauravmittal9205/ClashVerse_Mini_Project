// Firebase App + Auth initialization
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyARqZWxjzDSLJlYLCvJv_ZM6xloatP8Bdc",
    authDomain: "clashverse-32095.firebaseapp.com",
    projectId: "clashverse-32095",
    storageBucket: "clashverse-32095.firebasestorage.app",
    messagingSenderId: "989911936521",
    appId: "1:989911936521:web:23a45430ca79a88415d2d8",
    measurementId: "G-MXQPRNT91X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics (only in browser/production)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Auth
export const auth = getAuth(app);

// OAuth providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const githubProvider = new GithubAuthProvider();

export default app;
