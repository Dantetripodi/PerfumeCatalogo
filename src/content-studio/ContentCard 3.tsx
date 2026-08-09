import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ContentCardProps {
  icon: string;
  label: string;
  content: string | string[];
  className?: string;
}

/**
 * Card reutilizable para mostrar un bloque de contenido generado.
 * Incluye botón de "Copiar al portapapeles" con feedback visual.
 */
const ContentCard: React.FC<ContentCardProps> = ({ icon, label, content, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const displayText = Array.isArray(content) ? content.join(" ") : content;
  const displayContent = Array.isArray(content) ? (
    <div className="flex flex-wrap gap-2">
      {content.map((tag, i) => (
        <span
          key={i}
          className="rounded-full bg-[#F8F0E3] px-3 py-1 text-xs font-medium text-[#1A2238] border border-[#E8DDBF]"
        >
          {tag}
        </span>
      ))}
    </div>
  ) : (
    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#1A2238]">
      {content}
    </pre>
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback para browsers sin clipboard API
      const el = document.createElement("textarea");
      el.value = displayText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-xl border border-[#E8DDBF] bg-white shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8DDBF] bg-[#FBF8F1] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{icon}</span>
          <h3 className="text-sm font-semibold text-[#1A2238]">{label}</h3>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-[#1A2238] text-white hover:bg-[#25304F]"
          }`}
          aria-label={`Copiar ${label}`}
        >
          {copied ? (
            <>
              <Check size={12} />
              Copiado
            </>
          ) : (
            <>
              <Copy size={12} />
              Copiar
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">{displayContent}</div>
    </div>
  );
};

export default ContentCard;
