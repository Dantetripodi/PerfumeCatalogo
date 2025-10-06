export function formatPrice(value: number | "Consultar"): string {
    return typeof value === "number" ? `$${value}` : "Consultar";
  }
  
  export function lineItemTotal(price: number | "Consultar", qty: number): string {
    return typeof price === "number" ? `$${price * qty}` : "Consultar";
  }
  
  export function computeNumericTotal(items: Array<{ price: number | "Consultar"; qty: number }>): number | "Consultar" {
    const hasConsult = items.some(i => typeof i.price !== "number");
    if (hasConsult) return "Consultar";
    return items.reduce((acc, i) => acc + (i.price as number) * i.qty, 0);
  }