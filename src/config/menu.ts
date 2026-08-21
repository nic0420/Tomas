export interface MegaMenuItem {
  name: string;
  filterName: string;
  subcategories: string[];
}

export const megaMenu: MegaMenuItem[] = [
  {
    name: 'AIRSOFT',
    filterName: 'Airsoft',
    subcategories: [
      'RÉPLICAS DE AIRSOFT',
      'CARGADORES PARA RÉPLICAS',
      'BATERÍAS Y CARGADORES',
      'BBS / GREEN GAS / CO2 / HPA',
      'GRANADAS DE AIRSOFT',
      'PIEZAS EXTERNAS',
      'PIEZAS INTERNAS',
      'PIEZAS PARA RIFLES A GAS',
      'PIEZAS PARA PISTOLAS',
      'PIEZAS PARA SNIPERS',
      'SPEEDSOFT'
    ]
  },
  {
    name: 'AIRGUN',
    filterName: 'Airgun',
    subcategories: [
      'PISTOLAS Y REVÓLVERES',
      'CARABINAS DE AIRE',
      'CARGADORES',
      'PERDIGONES Y PROYECTILES',
      'PIEZAS Y ACCESORIOS'
    ]
  },
  { 
    name: 'PAINTBALL', 
    filterName: 'Paintball',
    subcategories: [
      'MARCADORES',
      'CO2 / HPA',
      'MÁSCARAS Y LENTES',
      'LOADERS Y CARGADORES',
      'CINTURONES PARA PODS Y CILINDROS',
      'PROYECTILES PAINTBALL',
      'PIEZAS DE REPOSICIÓN',
      'CUSTOMIZACIÓN Y TUNE-UP'
    ] 
  },
  {
    name: 'ÓPTICA E ILUMINACIÓN',
    filterName: 'Óptica e Iluminación',
    subcategories: [
      'MIRAS TELESCÓPICAS',
      'BINOCULARES',
      'TELÉMETROS (RANGEFINDERS)',
      'MIRAS RED DOT Y VERDE DOT',
      'MIRAS DE VISIÓN NOCTURNA',
      'MIRAS TÉRMICAS',
      'SPOTTING SCOPES',
      'LUCES Y LÁSERES',
      'ACOG',
      'MIRAS DE FIBRA Y TRITIUM',
      'ANILLOS DE MIRA',
      'SOPORTES Y BASES DE MIRA',
      'ACCESORIOS DE MIRA'
    ]
  },
  {
    name: 'FITNESS & RECUPERACIÓN',
    filterName: 'Fitness & Recuperación',
    subcategories: [
      'ACONDICIONAMIENTO FÍSICO',
      'EQUIPOS DE ENTRENAMIENTO / TECNOLOGÍA',
      'FISIOTERAPIA Y RECUPERACIÓN MUSCULAR',
      'ENTRENAMIENTO FUNCIONAL',
      'MOVILIDAD, CORE Y EQUILIBRIO',
      'YOGA Y PILATES'
    ]
  },
  {
    name: 'OUTDOOR & SURVIVAL',
    filterName: 'Outdoor & Survival',
    subcategories: [
      'BARCOS Y CANOAS',
      'SOPORTES PARA BARCOS Y KAYAKS',
      'KAYAKS',
      'MOTORES NÁUTICOS',
      'STAND UP PADDLE (SUP)',
      'MOCHILAS TÉRMICAS',
      'BOLSAS TÉRMICAS',
      'BOTELLAS TÉRMICAS',
      'RED DE CAMUFLAJE MILITAR',
      'SILLAS Y MESAS DE CAMPING',
      'LINTERNAS DE ACAMPAMENTO',
      'PRIMEROS AUXILIOS',
      'CUCHILLOS',
      'EQUIPOS DE SALVAMENTO',
      'GAZEBOS PORTÁTILES',
      'PULSERAS DE SUPERVIVENCIA',
      'GPS Y RASTREADORES PARA ANIMALES'
    ]
  },
  { name: 'RELOJES', filterName: 'Relojes', subcategories: [] },
  {
    name: 'DEPORTES Y OCIO',
    filterName: 'Deportes y Ocio',
    subcategories: [
      'BEACH TENNIS',
      'PICKLEBALL',
      'PÁDEL',
      'ACCESORIOS'
    ]
  },
  {
    name: 'MARCADORES NO LETALES',
    filterName: 'Marcadores No Letales',
    subcategories: [
      'MARCADORES',
      'CARGADORES',
      'ACCESORIOS'
    ]
  },
  {
    name: 'PRODUCTOS COCA-COLA',
    filterName: 'Productos Coca-Cola',
    subcategories: [
      'AURICULARES Y PARLANTES',
      'VASOS Y BOTELLAS TÉRMICAS'
    ]
  },
  {
    name: 'OFERTAS Y PROMOCIONES',
    filterName: 'Ofertas y Promociones',
    subcategories: ['COMBOS PROMOCIONALES']
  }
];
