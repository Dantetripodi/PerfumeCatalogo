import React, { useState, useEffect, useRef } from "react";
import { FlaskConical, X, Lock } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STUDIO_PIN = import.meta.env.VITE_STUDIO_PIN ?? "dt2025";
const SESSION_KEY = "dtfragancias_studio_unlocked";

/** Verifica si ya fue desbloqueado en esta sesión */
export function isStudioUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === STUDIO_PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setPin("");
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm rounded-2xl border border-[#E8DDBF] bg-white p-8 shadow-2xl transition-transform ${
          shake ? "animate-shake" : ""
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F0E3]">
            <FlaskConical size={28} className="text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1A2238]">Content Studio</h2>
          <p className="mt-1 text-sm text-gray-500">Acceso restringido</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={inputRef}
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="PIN de acceso"
              className={`w-full rounded-xl border py-3 pl-9 pr-4 text-center text-lg tracking-[0.4em] text-[#1A2238] placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400 focus:ring-red-300"
                  : "border-[#E8DDBF] focus:ring-[#D4AF37]"
              }`}
              maxLength={20}
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="mb-3 text-center text-sm font-medium text-red-500">
              PIN incorrecto. Intentá de nuevo.
            </p>
          )}

          <button
            type="submit"
            disabled={pin.length === 0}
            className="w-full rounded-xl bg-[#1A2238] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#25304F] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ingresar
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
};

export default PinModal;
