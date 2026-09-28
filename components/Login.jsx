import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ShieldCheck, Wallet, BarChart3, FileDown } from "lucide-react";
import Benefit from "./ui/Benefit";
import { auth, db } from "@/lib/firebase.config";

export default function Login({ onLogin }) {
  const [busy, setBusy] = useState(false);

  const login = async () => {
    setBusy(true);
    try {
      if (!auth)
        throw new Error(
          "Firebase is not configured properly in firebaseConfig.js",
        );
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      onLogin(result.user);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">
            <Wallet size={21} />
          </span>
          <span>
            <strong>SpendWise</strong>
            <small>Personal expense tracker</small>
          </span>
        </div>
      </header>
      <main className="login-layout">
        <section className="hero-copy">
          <span className="eyebrow">
            <ShieldCheck size={14} /> Secured by Google Sign-In
          </span>
          <h1>
            Know exactly where
            <br />
            your <em>money</em> goes.
          </h1>
          <p>
            A single clean dashboard to record expenses, slice them by date,
            source and amount, and export polished reports whenever you need
            them.
          </p>
          <div className="benefits">
            <Benefit
              icon={<Wallet />}
              title="Track every rupee"
              text="Add cash or transfer expenses in seconds."
            />
            <Benefit
              icon={<BarChart3 />}
              title="Live analytics"
              text="Charts and trends filtered exactly how you want."
            />
            <Benefit
              icon={<FileDown />}
              title="PDF & Excel export"
              text="Download any month or filtered report."
            />
          </div>
        </section>
        <section className="login-card">
          <div className="login-icon">
            <Wallet size={29} />
          </div>
          <h2>Welcome back</h2>
          <p>Continue with your Google account to open your dashboard.</p>
          <button className="primary wide" onClick={login} disabled={busy}>
            <span>G</span>
            {busy ? "Connecting…" : "Continue with Google"}
          </button>
          <small>We only read your name, email and profile picture.</small>
        </section>
      </main>
    </>
  );
}
