import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, InfoBanner } from "../components/ui";

const STORAGE_KEY = "truesmm-access-key";
const BACKEND_URL = ((import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() || "https://truesmm-backend.onrender.com").replace(/\/$/, "");

interface LoginPageProps {
  onAuthenticated: () => void;
}


export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [keyInput, setKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [remainingMsg, setRemainingMsg] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = keyInput.trim().toUpperCase();
    if (!trimmedKey) { setError("Enter your access key."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key: trimmedKey }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Invalid access key.");
      setSuccess(true);
      setRemainingMsg(payload.lifetime ? "Lifetime access" : "Access granted");
      setTimeout(() => onAuthenticated(), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(79, 70, 229, 0.06) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center justify-center mb-5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20">
              <svg viewBox="0 0 100 100" className="h-8 w-8 text-white" fill="currentColor">
                <path d="M50 22 L58 42 L78 46 L64 60 L68 80 L50 70 L32 80 L36 60 L22 46 L42 42 Z" />
              </svg>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            TRUESMM
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-1 text-sm text-slate-500"
          >
            Social Media Marketing Panel
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-900">Access granted</p>
              <p className="mt-1 text-sm text-slate-500">Welcome to TRUESMM…</p>
              {remainingMsg && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {remainingMsg}
                </p>
              )}
            </motion.div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your access key to continue.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Access Key"
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder="TRUESMM-XXXX-XXXX-XXXX"
                  disabled={loading}
                  autoFocus
                  className="font-mono tracking-wide text-sm"
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <InfoBanner kind="danger">{error}</InfoBanner>
                  </motion.div>
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={!keyInput.trim()}>
                  Sign in
                </Button>

                <p className="text-center text-xs text-slate-500">
                  Keys are device-locked. One key per browser.
                </p>
              </form>
            </>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-slate-400"
        >
          Restricted access. Authorized personnel only.
        </motion.p>
      </motion.div>
    </div>
  );
}
