# Documentación Oficial del Proyecto

Esta es la documentación oficial inicial del proyecto. Detalla las tecnologías utilizadas, la estructura del proyecto y las funcionalidades principales. Este documento se irá actualizando a medida que el proyecto crezca.

## 🚀 Tecnologías Utilizadas

### Frontend (Cliente)
- **React 19**: Biblioteca principal para construir la interfaz de usuario.
- **TypeScript**: Superset de JavaScript que añade tipado estático para un desarrollo más robusto.
- **Vite**: Entorno de desarrollo rápido y empaquetador (bundler).
- **Tailwind CSS**: Framework de CSS utilitario para un diseño rápido y responsivo.
- **React Router DOM**: Manejo de rutas y navegación dentro de la aplicación de una sola página (SPA).
- **Zustand**: Gestor de estado global ligero y rápido (alternativa a Redux/Context).
- **Lucide React**: Biblioteca de iconos modernos y consistentes.
- **Embla Carousel React**: Biblioteca para crear carruseles y sliders de manera fluida.
- **PapaParse**: Parseador de archivos CSV utilizado para la importación/exportación masiva de datos (ej. productos).

### Scripts y Herramientas Adicionales
- **Cheerio & Axios**: Utilizados en el entorno de Node.js (carpeta `scripts/`) para realizar web scraping de productos.
- **ESLint & TypeScript ESLint**: Herramientas de análisis de código para mantener la calidad y el estándar de programación.

---

## 📁 Estructura del Proyecto

El proyecto está organizado de manera modular para separar responsabilidades y facilitar la escalabilidad:

```text
/
├── scripts/               # Scripts ejecutables en Node.js (ej. scrape.js para scraping de productos)
├── src/
│   ├── assets/            # Archivos estáticos como imágenes o fuentes
│   ├── components/        # Componentes reutilizables de la interfaz
│   │   ├── admin/         # Componentes específicos del panel de administración
│   │   ├── cart/          # Componentes relacionados con el carrito de compras
│   │   ├── home/          # Componentes de la página principal
│   │   ├── layout/        # Componentes de estructura global (Navbar, Footer, Sidebar, etc.)
│   │   └── product/       # Componentes de visualización de productos
│   │
│   ├── config/            # Configuraciones globales de la aplicación
│   ├── lib/               # Utilidades y funciones helper (ej. utils.ts)
│   ├── pages/             # Vistas/Páginas principales enlazadas a rutas
│   │   ├── admin/         # Vistas del panel de control
│   │   │   ├── Dashboard.tsx      # Resumen principal del admin
│   │   │   ├── ProductsAdmin.tsx  # Gestión de inventario, carga manual y CSV
│   │   │   └── SettingsAdmin.tsx  # Configuraciones de la tienda
│   │   └── store/         # Vistas de cara al cliente (ej. Store.tsx)
│   │
│   ├── store/             # Estado global de la aplicación (Zustand)
│   │   ├── useAdminStore.ts       # Estado y lógica de administración
│   │   ├── useAuthStore.ts        # Estado de autenticación y datos de usuario (local)
│   │   ├── useCartStore.ts        # Estado del carrito de compras
│   │   └── useProductStore.ts     # Estado y caché del catálogo de productos
│   │
│   ├── App.tsx            # Componente raíz y definición de rutas principales
│   ├── index.css          # Estilos globales y directivas de Tailwind
│   └── main.tsx           # Punto de entrada de React
│
├── package.json           # Dependencias y scripts del proyecto
├── tailwind.config.js     # Configuración de estilos y diseño
└── vite.config.ts         # Configuración del entorno de construcción Vite
```

---

## ⚙️ Funcionalidades Principales

### 1. Panel de Administración (`/admin`)
- **Dashboard**: Vista general con métricas e información clave.
- **Gestión de Productos**: 
  - Creación, edición y eliminación de productos.
  - **Importación masiva**: Soporte para cargar y procesar archivos CSV (gracias a PapaParse) para actualizar el catálogo de forma rápida.
- **Configuraciones**: Ajustes generales de la aplicación.

### 2. Tienda y Catálogo (`/store`)
- Visualización del listado de productos con imágenes, precios y características.
- Filtros y categorías.

### 3. Carrito de Compras y Checkout
- Agregar, modificar y eliminar artículos mediante el estado global gestionado por Zustand (`useCartStore`).
- **Checkout por WhatsApp:** La tienda no cuenta con una pasarela de pago automática. Al finalizar la compra, el cliente completa sus datos (Nombre, Teléfono, Dirección) y se genera un enlace directo a WhatsApp (usando el número de la tienda) con el detalle completo del pedido, total a pagar y datos de contacto para coordinar el pago y envío manualmente.

### 4. Cuentas de Usuario
- Sistema de autenticación simulado (actualmente local via `localStorage` en `useAuthStore`).
- **Registro y Login:** Los clientes pueden crear una cuenta para no tener que ingresar sus datos repetidamente en el checkout.
- **Mi Perfil:** Cada usuario tiene un historial de compras detallado donde puede ver sus pedidos realizados y el estado actual de los mismos.

### 5. Automatización (Scraping)
- El proyecto cuenta con un sistema de extracción de datos automatizado (Web Scraping). 
- Mediante el script `npm run scrape` (`scripts/scrape.js`), se extrae información de otros sitios y se guarda o sincroniza con el catálogo de la aplicación utilizando `axios` y `cheerio`.

---

> **Nota**: Esta documentación fue generada como base. Cualquier nueva dependencia, cambio de estructura de carpetas o grandes módulos de código deberán añadirse a este archivo para mantenerlo como una fuente de verdad confiable.
