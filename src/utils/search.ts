import type { Product } from '../store/useCartStore';

export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Sinónimos español -> términos reales en los nombres de producto (inglés/portugués)
const SYNONYMS: Record<string, string[]> = {
  'balines': ['bbs', 'bb', 'pellet', 'pellets', 'chumbo', 'chumbos', 'proyectil', 'proyectiles', 'perdigon', 'perdigones', 'diabolo', 'esfera'],
  'balin': ['bbs', 'bb', 'pellet', 'pellets', 'chumbo', 'chumbos', 'proyectil', 'proyectiles', 'perdigon', 'perdigones', 'diabolo', 'esfera'],
  'bbs': ['bb', 'pellet', 'pellets', 'chumbo', 'chumbos', 'proyectil', 'proyectiles', 'bolinha'],
  'bb': ['bbs', 'pellet', 'pellets', 'chumbo', 'chumbos'],
  'repuesto': ['part', 'parts', 'peca', 'pecas', 'pieza', 'piezas', 'spare', 'replacement', 'reposicao', 'accesorio', 'acessorios', 'internal', 'kit'],
  'repuestos': ['part', 'parts', 'peca', 'pecas', 'pieza', 'piezas', 'spare', 'replacement', 'reposicao', 'accesorio', 'acessorios', 'internal', 'kit'],
  'pieza': ['part', 'parts', 'peca', 'pecas', 'spare', 'replacement', 'reposicao'],
  'piezas': ['part', 'parts', 'peca', 'pecas', 'spare', 'replacement', 'reposicao'],
  'parte': ['part', 'parts', 'peca', 'pecas', 'spare', 'replacement'],
  'partes': ['part', 'parts', 'peca', 'pecas', 'spare', 'replacement'],
  'municion': ['ammo', 'bbs', 'bb', 'pellet', 'pellets', 'chumbo', 'chumbos', 'proyectil', 'proyectiles', 'municao', 'rondas'],
  'pistola': ['pistol', 'pistola', 'revolver', 'handgun', 'sidearm'],
  'rifle': ['rifle', 'carabina', 'carabines', 'aeg', 'sniper', 'gun'],
  'carabina': ['carbine', 'rifle', 'airgun', 'carabines'],
  'cargador': ['magazine', 'mag', 'cargador', 'loader', 'magazines'],
  'mira': ['scope', 'sight', 'luneta', 'lunetas', 'red dot', 'optic', 'mira'],
  'visores': ['scope', 'sight', 'luneta', 'lunetas', 'red dot', 'optic'],
  'linterna': ['flashlight', 'torch', 'light', 'luz', 'luzes', 'lanterna'],
  'cuchillo': ['knife', 'knives', 'faca', 'facas', 'navaja'],
  'cuchillos': ['knife', 'knives', 'faca', 'facas', 'navaja'],
  'camuflaje': ['camo', 'camuflagem', 'camuflaje', 'military'],
  'mochila': ['backpack', 'mochila', 'rucksack'],
  'bateria': ['battery', 'bateria', 'lipos', 'lipo'],
  'granada': ['grenade', 'granada', 'granadas'],
  'mascara': ['mask', 'mascara', 'lens', 'lente', 'lentes', 'maskas'],
  'lente': ['lens', 'lentes', 'lente'],
  'binoculares': ['binoculos', 'binocular', 'binoculars', 'binoculares'],
  'gps': ['gps', 'rastreador', 'tracker'],
  'termica': ['thermal', 'termica'],
  'termico': ['thermal', 'termica'],
  'nocturna': ['night vision', 'nocturna', 'nvg'],
  'soporte': ['mount', 'suporte', 'suportes', 'base', 'soporte'],
  'anillo': ['ring', 'anel', 'anillos', 'aneis'],
  'silenciador': ['silencer', 'silenciador', 'suppressor'],
  'canon': ['barrel', 'canon', 'cano', 'barril'],
  'culata': ['stock', 'culata', 'butt'],
  'empunadura': ['grip', 'empunadura', 'empuñadura', 'pistol grip'],
  'guantes': ['glove', 'gloves', 'luva', 'luvas'],
  'casco': ['helmet', 'casco', 'cap', 'helmet'],
  'paintball': ['paintball', 'marcador', 'marker', 'marcadores'],
  'airsoft': ['airsoft', 'aeg', 'gbb', 'replica', 'replicas'],
  'pellet': ['pellets', 'bbs', 'bb', 'chumbo', 'chumbos', 'diabolo'],
  'pellets': ['pellet', 'bbs', 'bb', 'chumbo', 'chumbos', 'diabolo'],
  'co2': ['co2', 'carbon dioxide', 'co2'],
  'tactico': ['tactical', 'tatico', 'tactico', 'molle'],
  'militar': ['military', 'militar', 'mil'],
  'gafas': ['glasses', 'goggles', 'gafas', 'eyewear', 'oculos'],
  'portacargador': ['mag pouch', 'magazine', 'mag', 'pouch'],
  'accesorio': ['accesorio', 'accessory', 'acessorio', 'acessorios', 'part', 'parts', 'kit'],
  'accesorios': ['accesorios', 'accessories', 'acessorio', 'acessorios', 'part', 'parts', 'kit'],
  'kayak': ['kayak', 'kaik', 'caiaque', 'caiaques', 'canoe', 'canoa'],
  'bote': ['boat', 'bote', 'barco', 'canoa', 'canoe', 'inflatable'],
  'bomba': ['pump', 'bomba', 'compressor', 'inflador'],
  'compresor': ['compressor', 'compresor', 'pump', 'fill station', 'estacao'],
  'recarga': ['fill', 'recharge', 'recarga', 'station', 'recarregar', 'nipple'],
  'aire': ['airgun', 'air', 'pneumatic', 'pressao', 'presion', 'pcp'],
  'diana': ['target', 'diana', 'alvo', 'targets', 'wst'],
  'soplador': ['blower', 'soplador'],
  'flecha': ['arrow', 'flecha', 'seta', 'arco', 'archery'],
  'arco': ['bow', 'arco', 'archery', 'arquearia', 'seta', 'arrow'],
  'padel': ['padel', 'paddle', 'paleta'],
  'pelota': ['ball', 'pelota', 'bola', 'bolas', 'bolinha', 'pickleball', 'tennis'],
  'pelotas': ['ball', 'pelota', 'bola', 'bolas', 'bolinha', 'pickleball', 'tennis'],
  'reloj': ['watch', 'reloj', 'relogio', 'smartwatch'],
  'coca': ['coca', 'cola', 'coca-cola'],
  'telefono': ['phone', 'fone', 'fones', 'headphone', 'headset', 'auricular'],
  'parlante': ['speaker', 'caixa', 'caixas', 'sound', 'bluetooth', 'parlante'],
  'vaso': ['cup', 'vaso', 'copo', 'copos', 'garrafa', 'botella'],
  'botella': ['bottle', 'botella', 'garrafa', 'copo'],
  'sup': ['sup', 'stand up paddle', 'paddle'],
};

const getSynonyms = (term: string): string[] => SYNONYMS[term] || [];

const buildSearchString = (p: Product): string =>
  normalizeText(`${p.nombre_producto} ${p.categoria} ${p.descripcion} ${p.caracteristicas} ${p.sku || ''}`);

// Coincidencia con límites de palabra: "bb" no debe matchear "gbb"/"blowback",
// pero "0.25g" sí debe matchear "0.25g" dentro de "0.25G / 2700R".
const containsWord = (text: string, word: string): boolean => {
  if (!word) return false;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(text);
};

export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query || !query.trim()) return products;
  
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  
  return products.filter(p => {
    const searchString = buildSearchString(p);
    return terms.every(term => {
      const alternatives = [term, ...getSynonyms(term)];
      return alternatives.some(alt => containsWord(searchString, alt));
    });
  });
};

export const searchCategories = (categories: string[], query: string): string[] => {
  if (!query || !query.trim()) return categories;
  
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  
  return categories.filter(c => {
    const searchString = normalizeText(c);
    return terms.every(term => {
      const alternatives = [term, ...getSynonyms(term)];
      return alternatives.some(alt => searchString.includes(alt));
    });
  });
};
