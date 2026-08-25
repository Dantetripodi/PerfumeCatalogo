import { useState } from "react";
import {
  Check,
  Clock3,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import type { Perfume } from "../types";
import type { ContentPack, ContentPackPayload, ImageConcept, ReelIdea, StoryIdea } from "./contentPackTypes";

export interface ContentPackEditorProps {
  pack: ContentPack;
  product?: Pick<Perfume, "name" | "image"> | null;
  onChange: (pack: ContentPack) => void;
  onSave: () => Promise<void>;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onRegenerate: () => Promise<void>;
  saving?: boolean;
}

type Action = "save" | "approve" | "reject" | "regenerate";

const statusLabels: Record<ContentPack["status"], string> = {
  draft: "Borrador",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const statusClasses: Record<ContentPack["status"], string> = {
  draft: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function lines(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function Field({ label, value, onChange, rows = 4, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#1A2238]">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-lg border border-[#E8DDBF] bg-white px-3 py-2.5 text-sm leading-relaxed text-[#1A2238] outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
      />
    </label>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[#E8DDBF] bg-[#FBF8F1] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-[#1A2238]">
        {icon}
        <h3 className="font-serif text-lg font-bold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function ContentPackEditor({
  pack,
  product,
  onChange,
  onSave,
  onApprove,
  onReject,
  onRegenerate,
  saving = false,
}: ContentPackEditorProps) {
  const [action, setAction] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const busy = saving || action !== null;
  const payload = pack.payload;

  const updatePayload = (changes: Partial<ContentPackPayload>) => {
    onChange({ ...pack, payload: { ...payload, ...changes }, updatedAt: new Date().toISOString() });
  };

  const updateStory = (index: number, changes: Partial<StoryIdea>) => {
    const stories = payload.stories.map((story, storyIndex) => storyIndex === index ? { ...story, ...changes } : story);
    updatePayload({ stories });
  };

  const updateReel = (changes: Partial<ReelIdea>) => updatePayload({ reel: { ...payload.reel, ...changes } });
  const updateConcept = (index: number, changes: Partial<ImageConcept>) => {
    const imageConcepts = payload.imageConcepts.map((concept, conceptIndex) => conceptIndex === index ? { ...concept, ...changes } : concept);
    updatePayload({ imageConcepts });
  };

  const runAction = async (name: Action, callback: () => Promise<void>) => {
    setAction(name);
    setActionError(null);
    try {
      await callback();
    } catch {
      setActionError("No se pudo completar la acción. Revisá el estado e intentá de nuevo.");
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="space-y-5">
      <header className="rounded-xl border border-[#E8DDBF] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {product?.image ? <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#F8F0E3] text-[#D4AF37]"><FileText size={24} /></div>}
            <div className="min-w-0">
              <h2 className="truncate font-serif text-xl font-bold text-[#1A2238]">{product?.name ?? `Producto #${pack.productId}`}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className={`rounded-full px-2.5 py-1 font-semibold ${statusClasses[pack.status]}`}>{statusLabels[pack.status]}</span>
                <span className="inline-flex items-center gap-1"><Clock3 size={13} /> Creado {formatTimestamp(pack.createdAt)}</span>
                <span className="inline-flex items-center gap-1"><Clock3 size={13} /> Actualizado {formatTimestamp(pack.updatedAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => void runAction("regenerate", onRegenerate)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DDBF] px-3 py-2 text-xs font-semibold text-[#1A2238] transition hover:bg-[#F8F0E3] disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={14} /> Regenerar</button>
            <button type="button" disabled={busy} onClick={() => void runAction("reject", onReject)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"><X size={14} /> Rechazar</button>
            <button type="button" disabled={busy} onClick={() => void runAction("approve", onApprove)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Check size={14} /> Aprobar</button>
            <button type="button" disabled={busy} onClick={() => void runAction("save", onSave)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A2238] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#25304F] disabled:cursor-not-allowed disabled:opacity-50"><Save size={14} /> {action === "save" ? "Guardando…" : "Guardar"}</button>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#D4AF37]/40 bg-[#FFF9E8] p-3 text-xs leading-relaxed text-[#6D5713]"><ShieldAlert size={16} className="mt-0.5 shrink-0" />La aprobación es interna: este contenido no se publica automáticamente.</div>
        {actionError && <p role="alert" className="mt-3 text-sm text-rose-700">{actionError}</p>}
      </header>

      <Section title="Instagram" icon={<Sparkles size={19} className="text-[#D4AF37]" />}>
        <Field label="Caption" value={payload.instagramCaption} onChange={(value) => updatePayload({ instagramCaption: value })} rows={6} />
        {payload.stories.map((story, index) => <div key={`story-${index}`} className="rounded-lg border border-[#E8DDBF] bg-white p-3"><p className="mb-3 text-xs font-semibold text-gray-500">Historia {index + 1}</p><div className="grid gap-3 sm:grid-cols-2"><Field label="Título" value={story.title} onChange={(value) => updateStory(index, { title: value })} rows={2} /><Field label="Texto" value={story.text} onChange={(value) => updateStory(index, { text: value })} rows={3} /></div><div className="mt-3"><Field label="CTA" value={story.cta ?? ""} onChange={(value) => updateStory(index, { cta: value })} rows={2} /></div></div>)}
        <button type="button" disabled={busy} onClick={() => updatePayload({ stories: [...payload.stories, { title: "", text: "", cta: "" }] })} className="text-xs font-semibold text-[#9A7A1F] hover:underline disabled:opacity-50">+ Agregar historia</button>
      </Section>

      <Section title="Reel" icon={<FileText size={19} className="text-[#D4AF37]" />}>
        <Field label="Hook" value={payload.reel.hook} onChange={(value) => updateReel({ hook: value })} rows={3} />
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Shots (uno por línea)" value={payload.reel.shots.join("\n")} onChange={(value) => updateReel({ shots: lines(value) })} rows={5} /><Field label="Texto en pantalla (uno por línea)" value={payload.reel.onScreenText.join("\n")} onChange={(value) => updateReel({ onScreenText: lines(value) })} rows={5} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="CTA" value={payload.reel.cta} onChange={(value) => updateReel({ cta: value })} rows={3} /><Field label="Caption" value={payload.reel.caption} onChange={(value) => updateReel({ caption: value })} rows={4} /></div>
      </Section>

      <Section title="WhatsApp y hashtags" icon={<MessageCircle size={19} className="text-[#D4AF37]" />}>
        <Field label="Mensaje de WhatsApp" value={payload.whatsappText} onChange={(value) => updatePayload({ whatsappText: value })} rows={6} />
        <Field label="Hashtags (uno por línea)" value={payload.hashtags.join("\n")} onChange={(value) => updatePayload({ hashtags: lines(value) })} rows={4} />
      </Section>

      <Section title="Conceptos de imagen" icon={<ImageIcon size={19} className="text-[#D4AF37]" />}>
        {payload.imageConcepts.map((concept, index) => <div key={`concept-${index}`} className="rounded-lg border border-[#E8DDBF] bg-white p-3"><p className="mb-3 text-xs font-semibold text-gray-500">Concepto {index + 1}</p><div className="grid gap-3 sm:grid-cols-2"><Field label="Título" value={concept.title} onChange={(value) => updateConcept(index, { title: value })} rows={2} /><Field label="Texto superpuesto" value={concept.overlayText ?? ""} onChange={(value) => updateConcept(index, { overlayText: value })} rows={2} /></div><div className="mt-3"><Field label="Escena" value={concept.scene} onChange={(value) => updateConcept(index, { scene: value })} rows={4} /></div></div>)}
        <button type="button" disabled={busy} onClick={() => updatePayload({ imageConcepts: [...payload.imageConcepts, { title: "", scene: "", overlayText: "" }] })} className="text-xs font-semibold text-[#9A7A1F] hover:underline disabled:opacity-50">+ Agregar concepto</button>
      </Section>
    </div>
  );
}
