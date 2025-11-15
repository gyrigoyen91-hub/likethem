# LikeThem - Dress like the ones you admire

Una plataforma exclusiva de moda curada por influencers donde la exclusividad y el estilo se encuentran.

## 🎯 Concepto

LikeThem es una marketplace de moda exclusiva que conecta a los seguidores con las prendas exactas que usan sus influencers favoritos. La plataforma mantiene un enfoque editorial y premium, con acceso limitado tanto para vendedores como compradores.

### Características Principales

- **Exclusividad**: No todos pueden vender aquí. No todos pueden comprar aquí.
- **Curación por Influencers**: Cada tienda es curada personalmente por un influencer
- **Estilo Editorial**: Diseño minimalista inspirado en Net-a-Porter, SSENSE, By Far
- **Acceso Selectivo**: Sistema de solicitudes para mantener la exclusividad

## 🏗️ Estructura de la Plataforma

### 1. Landing Page / Home
- Hero section impactante con mensaje de marca
- Curadores destacados con estilo editorial
- Sección "Cómo Funciona" en 3 pasos
- Testimonios en estilo de quotes
- Footer limpio con newsletter

### 2. Explorar Tiendas
- Grid limpio (3 columnas desktop, 1-2 mobile)
- Filtros laterales colapsables
- Tarjetas con fotos editoriales de influencers
- Sistema de filtros por estilo, género, popularidad

### 3. Perfil de Curador / Tienda
- Hero horizontal con foto/video del influencer
- Bio curada y breve
- Grid de productos con storytelling
- Precios visibles solo para usuarios con acceso

### 4. Producto Individual
- Fotos grandes sin marcos
- Storytelling de la prenda
- Botón de solicitud de acceso
- Looks similares

### 5. Página "Solicita Acceso"
- Onboarding selectivo
- Dos formularios: vendedor y comprador
- Diseño minimalista y exclusivo

## 🎨 Estilo Visual

### Tipografías
- **Títulos**: Playfair Display, Editorial New, Canela
- **Texto**: Inter, Helvetica Neue, Maison Neue

### Paleta de Colores
- **Fondo**: Blanco puro (#FFFFFF)
- **Tipografía**: Negro carbón (#1A1A1A)
- **Neutros**: Gris claro, beige claro
- **Sin colores llamativos** - todo debe sentirse premium

### Inspiraciones Visuales
- Net-a-Porter
- SSENSE
- By Far
- The Frankie Shop

## 🚀 Tecnologías

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Imágenes**: Unsplash (placeholder)

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone [url-del-repositorio]
cd LikeThem
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
LikeThem/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Landing page
│   ├── explore/           # Página de exploración
│   ├── access/            # Página de solicitud de acceso
│   └── curator/[id]/      # Perfil de curador dinámico
├── components/            # Componentes reutilizables
│   ├── Hero.tsx          # Hero section
│   ├── FeaturedCurators.tsx
│   ├── HowItWorks.tsx
│   ├── Testimonials.tsx
│   ├── Footer.tsx
│   ├── CuratorGrid.tsx
│   └── FilterSidebar.tsx
├── public/               # Archivos estáticos
└── package.json
```

## 🎯 Próximos Pasos

- [ ] Implementar autenticación con redes sociales
- [ ] Panel de administración para curadores
- [ ] Sistema de pagos integrado
- [ ] Base de datos para productos y usuarios
- [ ] Sistema de notificaciones
- [ ] Optimización de imágenes
- [ ] Tests unitarios y de integración

## 📝 Licencia

Este proyecto es privado y exclusivo para LikeThem.

---

**LikeThem** - Dress like the ones you admire. # Redeploy trigger Sun Oct 19 17:14:46 -03 2025
