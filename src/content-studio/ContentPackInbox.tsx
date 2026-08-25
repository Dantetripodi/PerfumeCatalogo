import { useMemo, useState } from "react";
import { AlertCircle, Check, FileText, Inbox, LoaderCircle, Search, X } from "lucide-react";
import type { Perfume } from "../types";
import type { ContentPack, ContentPackStatus } from "./contentPackTypes";
import ContentPackEditor from "./ContentPackEditor";
import { filterContentPacks, getPackProduct, type ContentPackInboxTab } from "./ContentPackInbox.utils";

type ProductLookup = Pick<Perfume, "id" | "name" | "image">;

export interface ContentPackInboxProps {
  packs: ContentPack[];
  perfumes: ProductLookup[];
  currentPack: ContentPack | null;
  onSelectPack: (pack: ContentPack) => void;
  onUpdatePack: (pack: ContentPack) => void;
  onSave: (pack: ContentPack) => Promise<void>;
  onApprove: (pack: ContentPack) => Promise<void>;
  onReject: (pack: ContentPack) => Promise<void>;
  onRegenerate: (pack: ContentPack) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => Promise<void>;
}

const tabLabels: Array<{ value: ContentPackInboxTab; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Borradores" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
];

const statusLabels: Record<ContentPackStatus, string> = { draft: "Borrador", approved: "Aprobado", rejected: "Rechazado" };
const statusClasses: Record<ContentPackStatus, string> = { draft: "bg-amber-100 text-amber-800", approved: "bg-emerald-100 text-emerald-800", rejected: "bg-rose-100 text-rose-800" };

function PackStatus({ status }: { status: ContentPackStatus }) {
  const Icon = status === "approved" ? Check : status === "rejected" ? X : FileText;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${statusClasses[status]}`}><Icon size={12} />{statusLabels[status]}</span>;
}

export default function ContentPackInbox({ packs, perfumes, currentPack, onSelectPack, onUpdatePack, onSave, onApprove, onReject, onRegenerate, loading = false, error = null, onRetry }: ContentPackInboxProps) {
  const [tab, setTab] = useState<ContentPackInboxTab>("all");
  const [search, setSearch] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const visiblePacks = useMemo(() => filterContentPacks(packs, perfumes, search, tab), [packs, perfumes, search, tab]);
  const currentProduct = currentPack ? getPackProduct(currentPack, perfumes) : null;

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    setRetryError(null);
    try {
      await onRetry();
    } catch {
      setRetryError("No se pudieron cargar los content packs. Intentá nuevamente.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F0E3] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><div className="flex items-center gap-2 text-[#D4AF37]"><Inbox size={21} /><span className="text-xs font-semibold uppercase tracking-[0.2em]">Content Studio</span></div><h1 className="mt-1 font-serif text-3xl font-bold text-[#1A2238]">Inbox de contenido</h1><p className="mt-1 text-sm text-gray-500">Revisá, editá y aprobá los packs generados.</p></div>
          <div className="relative w-full max-w-sm"><Search size={17} className="absolute left-3 top-3 text-gray-400" /><input aria-label="Buscar por producto" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por producto…" className="w-full rounded-xl border border-[#E8DDBF] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1A2238] outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" /></div>
        </div>
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-[#E8DDBF] bg-white p-1">
          {tabLabels.map((item) => <button key={item.value} type="button" onClick={() => setTab(item.value)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === item.value ? "bg-[#1A2238] text-white" : "text-gray-500 hover:bg-[#F8F0E3] hover:text-[#1A2238]"}`}>{item.label}<span className="ml-1.5 text-xs opacity-70">{item.value === "all" ? packs.length : packs.filter((pack) => pack.status === item.value).length}</span></button>)}
        </div>

        {(error || retryError) && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><span className="flex items-center gap-2"><AlertCircle size={17} />{retryError ?? error}</span>{onRetry && <button type="button" disabled={retrying} onClick={handleRetry} className="font-semibold underline disabled:cursor-not-allowed disabled:opacity-50">{retrying ? "Reintentando…" : "Reintentar"}</button>}</div>}
        {(loading || retrying) && <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-[#E8DDBF] bg-white p-8 text-sm text-gray-500"><LoaderCircle size={18} className="animate-spin text-[#D4AF37]" />{retrying ? "Reintentando…" : "Cargando content packs…"}</div>}

        {!loading && !retrying && !error && !retryError && visiblePacks.length === 0 && <div className="rounded-2xl border-2 border-dashed border-[#E8DDBF] bg-white p-12 text-center"><Inbox size={34} className="mx-auto mb-3 text-[#D4AF37]" /><h2 className="font-serif text-xl font-bold text-[#1A2238]">No hay packs para mostrar</h2><p className="mt-1 text-sm text-gray-500">Probá cambiar el filtro o la búsqueda.</p></div>}

        {!loading && !retrying && visiblePacks.length > 0 && <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)]">
          <section aria-label="Lista de content packs" className="space-y-2">
            {visiblePacks.map((pack) => { const product = getPackProduct(pack, perfumes); const selected = currentPack === pack || (currentPack?.id && pack.id === currentPack.id) || (currentPack?.clientId && pack.clientId === currentPack.clientId); return <button key={pack.id ?? pack.clientId ?? `${pack.productId}-${pack.updatedAt}`} type="button" onClick={() => onSelectPack(pack)} className={`w-full rounded-xl border p-3 text-left transition ${selected ? "border-[#D4AF37] bg-[#FFF9E8] shadow-sm" : "border-[#E8DDBF] bg-white hover:border-[#D4AF37]/60"}`}><div className="flex gap-3"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F8F0E3]">{product?.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : <FileText className="m-4 text-[#D4AF37]" size={22} />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-bold text-[#1A2238]">{product?.name ?? `Producto #${pack.productId}`}</p><PackStatus status={pack.status} /></div><p className="mt-1 line-clamp-2 text-xs text-gray-500">{pack.payload.instagramCaption || "Sin caption"}</p><p className="mt-2 text-[11px] text-gray-400">{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(pack.updatedAt))}</p></div></div></button>; })}
          </section>
          <section aria-label="Detalle del content pack" className="min-w-0">{currentPack ? <ContentPackEditor pack={currentPack} product={currentProduct} onChange={onUpdatePack} onSave={() => onSave(currentPack)} onApprove={() => onApprove(currentPack)} onReject={() => onReject(currentPack)} onRegenerate={() => onRegenerate(currentPack)} /> : <div className="flex min-h-80 items-center justify-center rounded-2xl border-2 border-dashed border-[#E8DDBF] bg-white p-8 text-center"><div><FileText size={36} className="mx-auto mb-3 text-[#D4AF37]" /><h2 className="font-serif text-xl font-bold text-[#1A2238]">Seleccioná un pack</h2><p className="mt-1 text-sm text-gray-500">El detalle y el editor aparecen acá.</p></div></div>}</section>
        </div>}
      </div>
    </main>
  );
}
