import React, { useState } from "react";
import { X, FlaskConical, Images, LogOut, AlertCircle } from "lucide-react";
import { deletePerfume } from "../data/perfumesRepository";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useRemotePerfumes } from "../hooks/useRemotePerfumes";
import { Perfume } from "../types";
import Toast from "./Toast";
import PerfumeList from "./admin/PerfumeList";
import PerfumeForm from "./admin/PerfumeForm";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PanelMode = "list" | "form";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onOpenContentStudio?: () => void;
  onOpenCarousel?: () => void;
}

// ─── AdminPanel ────────────────────────────────────────────────────────────────

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onSaved,
  onOpenContentStudio,
  onOpenCarousel,
}) => {
  const { session, loading: authLoading, signIn, signOut } = useAdminAuth();

  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // Panel mode
  const [mode, setMode] = useState<PanelMode>("list");
  const [editingPerfume, setEditingPerfume] = useState<Perfume | null>(null);

  // Error banner (for CRUD errors surfaced by child forms)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const isAuthenticated = session !== null;

  // Remote data — only fetch when panel is open and user is authenticated
  const { perfumes, loading: perfumesLoading, refetch } = useRemotePerfumes();

  if (!isOpen) return null;

  // ── Auth handlers ────────────────────────────────────────────────────────────

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");
    setSigningIn(true);
    const error = await signIn(email, password);
    setSigningIn(false);
    if (error) {
      setLoginError(error);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setMode("list");
    setEditingPerfume(null);
  };

  // ── List actions ─────────────────────────────────────────────────────────────

  const handleNew = () => {
    setEditingPerfume(null);
    setErrorMessage(null);
    setMode("form");
  };

  const handleEdit = (perfume: Perfume) => {
    setEditingPerfume(perfume);
    setErrorMessage(null);
    setMode("form");
  };

  const handleDelete = async (perfume: Perfume) => {
    setErrorMessage(null);
    const result = await deletePerfume(perfume);

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    setToastMessage(`"${perfume.name}" borrado del catálogo.`);
    setShowToast(true);
    await refetch();
    onSaved();
  };

  // ── Form callbacks ────────────────────────────────────────────────────────────

  const handleFormSaved = async (operation: "created" | "updated") => {
    const label = operation === "created" ? "creado" : "actualizado";
    setToastMessage(`Perfume ${label} correctamente.`);
    setShowToast(true);
    setMode("list");
    setEditingPerfume(null);
    await refetch();
    onSaved();
  };

  const handleFormError = (message: string) => {
    setErrorMessage(message);
  };

  const handleBack = () => {
    setMode("list");
    setEditingPerfume(null);
    setErrorMessage(null);
  };

  // ── Header subtitle ───────────────────────────────────────────────────────────

  const subtitle = authLoading
    ? "Verificando sesión..."
    : !isAuthenticated
    ? "Ingresá tu email y contraseña para administrar productos"
    : mode === "form"
    ? editingPerfume
      ? `Editando: ${editingPerfume.name}`
      : "Nuevo perfume"
    : `${perfumes.length} perfumes en el catálogo`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101827]/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl">

        {/* ── Sticky header ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 p-4 backdrop-blur">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1A2238]">Panel admin</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && onOpenCarousel && (
              <button
                onClick={() => { onClose(); onOpenCarousel(); }}
                className="flex items-center gap-1.5 rounded-md border border-[#E8DDBF] px-3 py-2 text-sm font-medium text-[#1A2238] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                title="Generador de carruseles para Instagram"
              >
                <Images size={16} />
                Carrusel
              </button>
            )}
            {isAuthenticated && onOpenContentStudio && (
              <button
                onClick={() => { onClose(); onOpenContentStudio(); }}
                className="flex items-center gap-1.5 rounded-md border border-[#E8DDBF] px-3 py-2 text-sm font-medium text-[#1A2238] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                title="Ir al Content Studio"
              >
                <FlaskConical size={16} />
                Content Studio
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-md border border-[#E8DDBF] px-3 py-2 text-sm font-medium text-[#1A2238] transition-colors hover:border-red-300 hover:text-red-600"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Cerrar admin"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* ── Error banner ───────────────────────────────────────────────────── */}
        {errorMessage && (
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <p className="flex-1 text-sm text-red-700">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-600"
              aria-label="Cerrar error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        {authLoading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-sm text-gray-500">Verificando sesión…</p>
          </div>
        ) : !isAuthenticated ? (
          /* ── Login form ──────────────────────────────────────────────────── */
          <form onSubmit={handleLogin} className="mx-auto grid max-w-md gap-4 p-6">
            <label className="text-sm font-medium text-[#1A2238]">
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                autoFocus
                required
              />
            </label>
            <label className="text-sm font-medium text-[#1A2238]">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                required
              />
            </label>
            {loginError && (
              <p className="text-sm font-medium text-red-600">{loginError}</p>
            )}
            <button
              disabled={signingIn}
              className="rounded-md bg-[#1A2238] px-4 py-3 font-medium text-white hover:bg-[#25304F] disabled:opacity-60"
            >
              {signingIn ? "Ingresando…" : "Entrar al admin"}
            </button>
          </form>
        ) : mode === "list" ? (
          /* ── Product list ────────────────────────────────────────────────── */
          <PerfumeList
            perfumes={perfumes}
            loading={perfumesLoading}
            onNew={handleNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          /* ── Create / Edit form ──────────────────────────────────────────── */
          <PerfumeForm
            editingPerfume={editingPerfume}
            onBack={handleBack}
            onSaved={handleFormSaved}
            onError={handleFormError}
          />
        )}
      </div>

      {/* Toast — rendered inside the modal overlay so z-index stacks correctly */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default AdminPanel;
