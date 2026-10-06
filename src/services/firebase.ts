import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Same Firebase project as the production site (tango-chords.web.app).
const firebaseConfig = {
  apiKey: "AIzaSyCfY1kGu6IuEu2UD2NSQ2l1RKqDfpsaK-A",
  authDomain: "tango-chords.firebaseapp.com",
  projectId: "tango-chords",
  storageBucket: "tango-chords.firebasestorage.app",
  messagingSenderId: "153539945404",
  appId: "1:153539945404:web:2f68d9761c27391f3f41b9",
  measurementId: "G-E8BEF2XH4S",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "auth/popup-closed-by-user":
      return "Login popup was closed before completion.";
    case "auth/cancelled-popup-request":
      return "Login cancelled.";
    case "auth/popup-blocked":
      return "Login popup was blocked by the browser.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address but different sign-in credentials.";
    default:
      return error instanceof Error && error.message ? error.message : "An unknown error occurred.";
  }
}
