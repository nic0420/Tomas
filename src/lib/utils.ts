import { PROFIT_MARGIN_PERCENTAGE } from "../config/constants";

export function calculateARSPrice(precio_usd: number, dolarBlue: number): number {
  return (precio_usd * dolarBlue) * (1 + (PROFIT_MARGIN_PERCENTAGE / 100));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
