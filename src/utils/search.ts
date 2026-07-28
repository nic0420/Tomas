import type { Product } from '../store/useCartStore';

export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query || !query.trim()) return products;
  
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  
  return products.filter(p => {
    const searchString = normalizeText(
      `${p.nombre_producto} ${p.categoria} ${p.descripcion} ${p.caracteristicas} ${p.sku || ''}`
    );
    return terms.every(term => searchString.includes(term));
  });
};

export const searchCategories = (categories: string[], query: string): string[] => {
  if (!query || !query.trim()) return categories;
  
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  
  return categories.filter(c => {
    const searchString = normalizeText(c);
    return terms.every(term => searchString.includes(term));
  });
};
