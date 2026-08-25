import React, { useMemo, useState } from "react";
import { ArrowLeft, FlaskConical, Search, ChevronDown, Inbox, Sparkles } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { Perfume } from "../types";
import { formatPrice } from "../utils/price";
import { generateAllContent } from "./generators";
import { CONTENT_SECTION_LABELS, CONTENT_SECTION_ICONS, ContentSection } from "./types";
import ContentCard from "./ContentCard";
import ContentPackEditor from "./ContentPackEditor";
import ContentPackInbox from "./ContentPackInbox";
import { useContentPacks } from "./useContentPacks";
import type { ContentPack } from "./contentPackTypes";

interface ContentStudioProps {
  perfumes: Perfume[];
  onBack: () => void;
  adminIdentity: string | null;
  session: Session | null;
  isAdmin: boolean;
}

const SECTIONS: ContentSection[] = ["instagramCaption", "instagramStory", "reelScript", "whatsappText", "hashtags", "imagePrompt"];
type StudioMode = "generate" | "inbox";

const ContentStudio: React.FC<ContentStudioProps> = ({ perfumes, onBack, adminIdentity, session, isAdmin }) => {
  const [mode, setMode] = useState<StudioMode>("generate");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const selectedPerfume = perfumes.find((p) => p.id === selectedId) ?? null;
  const content = useMemo(() => selectedPerfume ? generateAllContent(selectedPerfume) : null, [selectedPerfume]);
  const filteredPerfumes = useMemo(() => {
    if (!search.trim()) return perfumes;
    const q = search.toLowerCase();
    return perfumes.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [perfumes, search]);
  const packs = useContentPacks({ adminIdentity, session, isAdmin, selectedProduct: selectedPerfume });

  const selectProduct = (product: Perfume) => {
    setSelectedId(product.id); setIsDropdownOpen(false); setSearch("");
    packs.selectProduct(product); packs.selectPack(null);
  };
  const generateDraft = () => { if (selectedPerfume) packs.createDraft(selectedPerfume, "manual"); };
  const save = async (pack: ContentPack) => {
    setSaving(true);
    try { if (await packs.savePack(pack)) setMode("inbox"); } finally { setSaving(false); }
  };
  const regenerate = async (pack: ContentPack) => {
    const product = perfumes.find((item) => item.id === pack.productId) ?? selectedPerfume;
    if (packs.regeneratePack(pack, product ?? undefined)) setMode("inbox");
  };

  if (!adminIdentity || !session) {
    return <div className="min-h-screen bg-[#F8F0E3]"><StudioHeader onBack={onBack} selectedPerfume={null} /><div className="mx-auto max-w-lg px-4 py-20 text-center"><p className="font-serif text-2xl font-bold text-[#1A2238]">Acceso denegado</p><p className="mt-3 text-sm text-gray-600">Content Agent está disponible únicamente para el administrador autenticado.</p></div></div>;
  }

  return <div className="min-h-screen bg-[#F8F0E3]"><StudioHeader onBack={onBack} selectedPerfume={selectedPerfume} /><div className="container mx-auto px-4 py-6">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-xl border border-[#E8DDBF] bg-white p-1"><ModeButton active={mode === "generate"} onClick={() => setMode("generate")}><Sparkles size={15} />Generar</ModeButton><ModeButton active={mode === "inbox"} onClick={() => setMode("inbox")}><Inbox size={15} />Bandeja</ModeButton></div>{mode === "inbox" && <button type="button" onClick={() => setMode("generate")} className="rounded-lg bg-[#1A2238] px-4 py-2 text-sm font-semibold text-white">Nuevo pack</button>}</div>
    {mode === "inbox" ? <ContentPackInbox packs={packs.packs} perfumes={perfumes} currentPack={packs.selectedPack} onSelectPack={packs.selectPack} onUpdatePack={packs.selectPack} onSave={save} onApprove={(pack) => { setSaving(true); return packs.approvePack(pack).then(() => undefined).finally(() => setSaving(false)); }} onReject={(pack) => { setSaving(true); return packs.rejectPack(pack).then(() => undefined).finally(() => setSaving(false)); }} onRegenerate={regenerate} loading={packs.loading} error={packs.error} onRetry={packs.refresh} /> : <>
      <div className="mb-8 text-center"><p className="mx-auto max-w-xl text-sm text-gray-500">Elegí un perfume del catálogo y generá captions, historias, reels, WhatsApp y prompts listos para revisar.</p></div>
      <ProductSelector perfumes={filteredPerfumes} selectedPerfume={selectedPerfume} selectedId={selectedId} search={search} isOpen={isDropdownOpen} onToggle={() => setIsDropdownOpen((value) => !value)} onSearch={setSearch} onSelect={selectProduct} />
      {!selectedPerfume && <EmptySelection />}
      {content && selectedPerfume && <><ProductHeader perfume={selectedPerfume} /><div className="mb-5 flex flex-wrap items-center justify-center gap-3"><button type="button" onClick={generateDraft} className="inline-flex items-center gap-2 rounded-lg bg-[#1A2238] px-4 py-2.5 text-sm font-semibold text-white"><Sparkles size={16} />Generar Content Pack</button>{packs.selectedPack && <button type="button" disabled={saving} onClick={() => void save(packs.selectedPack as ContentPack)} className="inline-flex items-center gap-2 rounded-lg border border-[#1A2238] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A2238] disabled:opacity-50">Guardar borrador</button>}<span className="text-xs text-gray-500">La vista previa se genera localmente; guardala para enviarla a la bandeja.</span></div><div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{SECTIONS.map((section) => <ContentCard key={section} icon={CONTENT_SECTION_ICONS[section]} label={CONTENT_SECTION_LABELS[section]} content={Array.isArray(content[section]) ? content[section] : content[section] as string} className={section === "reelScript" || section === "imagePrompt" ? "lg:col-span-2" : ""} />)}</div>{packs.selectedPack && <div className="mt-8"><ContentPackEditor pack={packs.selectedPack} product={selectedPerfume} onChange={packs.selectPack} onSave={() => save(packs.selectedPack as ContentPack)} onApprove={() => packs.approvePack(packs.selectedPack as ContentPack).then(() => undefined)} onReject={() => packs.rejectPack(packs.selectedPack as ContentPack).then(() => undefined)} onRegenerate={() => regenerate(packs.selectedPack as ContentPack)} saving={saving} /></div>} {!packs.selectedPack && <p className="mt-8 text-center text-xs text-gray-400">Generá el pack para abrir el editor y guardarlo como borrador.</p>}</>}
    </>}
  </div></div>;
};

function StudioHeader({ onBack, selectedPerfume }: { onBack: () => void; selectedPerfume: Perfume | null }) { return <div className="sticky top-0 z-40 border-b border-[#E8DDBF] bg-white/95 shadow-sm backdrop-blur"><div className="container mx-auto flex items-center gap-4 px-4 py-4"><button onClick={onBack} className="flex items-center gap-1.5 rounded-md p-2 text-[#1A2238] hover:bg-[#F8F0E3]" aria-label="Volver al catálogo"><ArrowLeft size={20} /><span className="hidden text-sm font-medium sm:inline">Catálogo</span></button><div className="flex flex-1 items-center gap-2"><FlaskConical size={22} className="text-[#D4AF37]" /><h1 className="font-serif text-xl font-bold text-[#1A2238] sm:text-2xl">Content Studio</h1></div>{selectedPerfume && <span className="hidden rounded-full bg-[#1A2238] px-3 py-1 text-xs font-medium text-white sm:inline">{selectedPerfume.name}</span>}</div></div>; }
function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold ${active ? "bg-[#1A2238] text-white" : "text-gray-500 hover:bg-[#F8F0E3]"}`}>{children}</button>; }
function ProductSelector({ perfumes, selectedPerfume, selectedId, search, isOpen, onToggle, onSearch, onSelect }: { perfumes: Perfume[]; selectedPerfume: Perfume | null; selectedId: number | null; search: string; isOpen: boolean; onToggle: () => void; onSearch: (value: string) => void; onSelect: (perfume: Perfume) => void }) { return <div className="relative mx-auto mb-10 max-w-lg"><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#1A2238]">Perfume</label><button type="button" onClick={onToggle} className="flex w-full items-center justify-between rounded-xl border-2 border-[#E8DDBF] bg-white px-4 py-3 text-left shadow-sm hover:border-[#D4AF37]">{selectedPerfume ? <div className="flex min-w-0 items-center gap-3"><img src={selectedPerfume.image} alt={selectedPerfume.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" /><div className="min-w-0"><p className="truncate font-semibold text-[#1A2238]">{selectedPerfume.name}</p><p className="text-xs text-gray-500">{selectedPerfume.brand} · {formatPrice(selectedPerfume.price)}</p></div></div> : <span className="text-gray-400">Seleccioná un perfume…</span>}<ChevronDown size={18} className={`shrink-0 text-gray-400 ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-hidden rounded-xl border border-[#E8DDBF] bg-white shadow-xl"><div className="border-b border-[#E8DDBF] p-2"><div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-gray-400" /><input autoFocus type="text" placeholder="Buscar perfume…" value={search} onChange={(event) => onSearch(event.target.value)} className="w-full rounded-lg border border-[#E8DDBF] bg-[#FBF8F1] py-2 pl-8 pr-3 text-sm" /></div></div><ul className="max-h-60 overflow-y-auto">{perfumes.length === 0 ? <li className="px-4 py-6 text-center text-sm text-gray-400">Sin resultados</li> : perfumes.map((perfume) => <li key={perfume.id}><button type="button" onClick={() => onSelect(perfume)} className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F8F0E3] ${perfume.id === selectedId ? "bg-[#FBF8F1]" : ""}`}><img src={perfume.image} alt={perfume.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#1A2238]">{perfume.name}</p><p className="text-xs text-gray-500">{perfume.brand} · {perfume.category} · {formatPrice(perfume.price)}</p></div></button></li>)}</ul></div>}</div>; }
function ProductHeader({ perfume }: { perfume: Perfume }) { return <div className="mx-auto mb-8 flex max-w-2xl items-center gap-4 rounded-2xl border border-[#E8DDBF] bg-white p-4 shadow-sm"><img src={perfume.image} alt={perfume.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" /><div className="min-w-0"><h2 className="truncate font-serif text-xl font-bold text-[#1A2238]">{perfume.name}</h2><p className="text-sm text-gray-500">{perfume.brand} · {perfume.category} · {perfume.gender}</p><p className="mt-1 text-sm font-semibold text-[#9A7A1F]">{formatPrice(perfume.price)} · {perfume.size}</p></div></div>; }
function EmptySelection() { return <div className="mx-auto max-w-lg rounded-2xl border-2 border-dashed border-[#E8DDBF] bg-white py-16 text-center"><FlaskConical size={40} className="mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} /><p className="font-serif text-lg font-semibold text-[#1A2238]">Elegí un perfume para empezar</p><p className="mt-1 text-sm text-gray-400">Se generará el contenido automáticamente</p></div>; }

export default ContentStudio;
