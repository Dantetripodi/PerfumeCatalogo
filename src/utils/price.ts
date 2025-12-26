export function formatPrice(value: number | "Consultar"): string {
  if (typeof value === "number") {
    return `$${value.toLocaleString('es-AR')}`;
  }
  return "Consultar";
}

export function lineItemTotal(price: number | "Consultar", qty: number): string {
  if (typeof price === "number") {
    return `$${(price * qty).toLocaleString('es-AR')}`;
  }
  return "Consultar";
}
  
  export function computeNumericTotal(items: Array<{ price: number | "Consultar"; qty: number }>): number | "Consultar" {
    const hasConsult = items.some(i => typeof i.price !== "number");
    if (hasConsult) return "Consultar";
    return items.reduce((acc, i) => acc + (i.price as number) * i.qty, 0);
  }