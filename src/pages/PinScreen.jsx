import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function PinScreen() {
  const { login } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const PIN_LENGTH = 6;

  const handleDigit = async (digit) => {
    if (pin.length >= PIN_LENGTH || loading) return;
    setError("");
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === PIN_LENGTH) await verifyPin(newPin);
  };

  const handleDelete = () => {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const verifyPin = async (pinToVerify) => {
    setLoading(true);
    try {
      await login(pinToVerify);
    } catch (err) {
      const msg = err.response?.data?.message || "Mã PIN không đúng";
      setError(msg);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin("");
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className="min-h-screen bg-[#080e1a] flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -translate-x-1/2 rounded-full top-1/4 left-1/2 w-80 h-80 bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative mb-12 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)]">
          <span className="text-4xl">💰</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Finance Manager
        </h1>
        <p className="text-slate-500 text-sm mt-1.5">Nhập mã PIN để tiếp tục</p>
      </div>

      {/* PIN dots */}
      <div className={`flex gap-4 mb-3 ${shake ? "shake" : ""}`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              i < pin.length
                ? "bg-emerald-400 scale-110 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                : "bg-white/10 border border-white/10"
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      <div className="flex items-center justify-center h-6 mb-5">
        {error && (
          <p className="text-sm font-medium text-rose-400 animate-fade-up">
            {error}
          </p>
        )}
        {loading && (
          <div className="w-4 h-4 border-2 rounded-full border-emerald-400 border-t-transparent animate-spin" />
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
        {digits.map((digit, idx) => {
          if (digit === "") return <div key={idx} />;

          if (digit === "⌫") {
            return (
              <button
                key={idx}
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                className="aspect-square flex items-center justify-center rounded-2xl text-slate-400
                           hover:text-white hover:bg-white/[0.06] active:scale-90 active:bg-white/10
                           transition-all duration-100 disabled:opacity-30"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
                  />
                </svg>
              </button>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => handleDigit(digit)}
              disabled={loading || pin.length >= PIN_LENGTH}
              className="aspect-square flex items-center justify-center rounded-2xl
                         bg-white/[0.04] border border-white/[0.06]
                         text-xl font-semibold text-white
                         hover:bg-white/[0.08] hover:border-white/10
                         active:scale-90 active:bg-emerald-500/10 active:border-emerald-500/30
                         transition-all duration-100 disabled:opacity-40
                         shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
            >
              {digit}
            </button>
          );
        })}
      </div>
    </div>
  );
}
