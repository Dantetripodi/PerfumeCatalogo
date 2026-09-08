export interface LocalPriceRow {
  name: string;
  collection: string;
  price: number | string | null;
}

export interface RemotePriceRow {
  id: number;
  name: string;
  collection: string;
  price: number | string | null;
}

export interface PriceUpdate {
  id: number;
  name: string;
  from: number | null;
  to: number | null;
}

function normalizePrice(price: number | string | null): number | null {
  if (price === null || price === "" || price === "Consultar") return null;

  const normalized = Number(price);
  return Number.isFinite(normalized) ? normalized : null;
}

/** Compares the local Yves Home source with Supabase without mutating either list. */
export function buildPriceUpdates(
  localRows: LocalPriceRow[],
  remoteRows: RemotePriceRow[]
): PriceUpdate[] {
  const localPrices = new Map(
    localRows
      .filter(row => row.collection === "home")
      .map(row => [row.name, normalizePrice(row.price)])
  );

  return remoteRows
    .filter(row => row.collection === "home" && localPrices.has(row.name))
    .flatMap(row => {
      const from = normalizePrice(row.price);
      const to = localPrices.get(row.name) ?? null;

      return from === to ? [] : [{ id: row.id, name: row.name, from, to }];
    });
}
