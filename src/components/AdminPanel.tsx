import React, { useEffect, useState } from "react";
import { Save, X, FlaskConical, Images } from "lucide-react";
import { getStoredPerfumeInputs, saveStoredPerfumes } from "../data";
import { PerfumeCategory, PerfumeInput } from "../types";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onOpenContentStudio?: () => void;
  onOpenCarousel?: () => void;
}

const emptyForm: PerfumeInput = {
  name: "",
  brand: "",
  price: "Consultar",
  gender: "unisex",
  category: "oriental",
  size: "100ml",
  image: "",
  description: "",
  notes: {
    top: [],
    middle: [],
    base: [],
  },
};

const ADMIN_PASSWORD = "DTFragancias2026";
const ADMIN_SESSION_KEY = "dtfragancias_admin_session";

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onSaved, onOpenContentStudio, onOpenCarousel }) => {
  const [form, setForm] = useState<PerfumeInput>(emptyForm);
  const [savedCount, setSavedCount] = useState(0);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");

  useEffect(() => {
    if (!isOpen) return;
    setSavedCount(getStoredPerfumeInputs().length);
  }, [isOpen]);

  if (!isOpen) return null;

  const updateField = <K extends keyof PerfumeInput>(field: K, value: PerfumeInput[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateNotes = (field: keyof PerfumeInput["notes"], value: string) => {
    setForm(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [field]: value.split(",").map(note => note.trim()).filter(Boolean),
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const current = getStoredPerfumeInputs();
    saveStoredPerfumes([...current, form]);
    setForm(emptyForm);
    setSavedCount(current.length + 1);
    onSaved();
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== ADMIN_PASSWORD) {
      setLoginError("Contraseña incorrecta");
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    setIsAuthenticated(true);
    setLoginError("");
    setPassword("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101827]/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 p-4 backdrop-blur">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1A2238]">Panel admin</h2>
            <p className="text-sm text-gray-500">
              {isAuthenticated ? `${savedCount} productos cargados localmente` : "Ingresá la contraseña para administrar productos"}
            </p>
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
            <button onClick={onClose} className="rounded-md p-2 text-gray-500 hover:bg-gray-100" aria-label="Cerrar admin">
              <X size={22} />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="mx-auto grid max-w-md gap-4 p-6">
            <label className="text-sm font-medium text-[#1A2238]">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                autoFocus
              />
            </label>
            {loginError && <p className="text-sm font-medium text-red-600">{loginError}</p>}
            <button className="rounded-md bg-[#1A2238] px-4 py-3 font-medium text-white hover:bg-[#25304F]">
              Entrar al admin
            </button>
            <p className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              Protección temporal del frontend. Con Supabase vamos a reemplazar esto por login real, base de datos y subida de imágenes.
            </p>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
          <TextInput label="Nombre" value={form.name} onChange={value => updateField("name", value)} required />
          <TextInput label="Marca" value={form.brand} onChange={value => updateField("brand", value)} required />
          <TextInput
            label="Precio"
            value={String(form.price)}
            onChange={value => updateField("price", value.toLowerCase() === "consultar" ? "Consultar" : Number(value))}
            placeholder="40000 o Consultar"
            required
          />
          <TextInput label="Tamaño" value={form.size} onChange={value => updateField("size", value)} required />

          <label className="text-sm font-medium text-[#1A2238]">
            Género
            <select
              value={form.gender}
              onChange={event => updateField("gender", event.target.value as PerfumeInput["gender"])}
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="unisex">Unisex</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </label>

          <TextInput
            label="Categoría"
            value={form.category}
            onChange={value => updateField("category", value as PerfumeCategory)}
            placeholder="oriental, floral, cítrico..."
            required
          />

          <label className="text-sm font-medium text-[#1A2238] sm:col-span-2">
            Imagen
            <input
              value={form.image}
              onChange={event => updateField("image", event.target.value)}
              placeholder="/imagenes/perfumes/nombre.jpg o URL"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              required
            />
          </label>

          <label className="text-sm font-medium text-[#1A2238] sm:col-span-2">
            Descripción
            <textarea
              value={form.description}
              onChange={event => updateField("description", event.target.value)}
              className="mt-1 min-h-24 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              required
            />
          </label>

          <TextInput label="Notas de salida" value={form.notes.top.join(", ")} onChange={value => updateNotes("top", value)} placeholder="Bergamota, limón" />
          <TextInput label="Notas de corazón" value={form.notes.middle.join(", ")} onChange={value => updateNotes("middle", value)} placeholder="Jazmín, lavanda" />
          <TextInput label="Notas de fondo" value={form.notes.base.join(", ")} onChange={value => updateNotes("base", value)} placeholder="Vainilla, ámbar" />

          <div className="flex items-end sm:col-span-2">
            <button className="flex w-full items-center justify-center rounded-md bg-[#1A2238] px-4 py-3 font-medium text-white hover:bg-[#25304F]">
              <Save size={18} className="mr-2" />
              Guardar producto local
            </button>
          </div>

          <p className="rounded-lg bg-[#F8F0E3] p-3 text-sm leading-6 text-[#1A2238] sm:col-span-2">
            Este panel guarda productos en este navegador. Para imágenes locales, primero agregá el archivo en public/imagenes/perfumes o public/imagenes/arabes y pegá una ruta como /imagenes/perfumes/nombre.jpg. Con Supabase vamos a reemplazar esto por carga real de imágenes, edición y borrado.
          </p>
        </form>
        )}
      </div>
    </div>
  );
};

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, required }) => (
  <label className="text-sm font-medium text-[#1A2238]">
    {label}
    <input
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
    />
  </label>
);

export default AdminPanel;
