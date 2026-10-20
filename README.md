# ResQ Suite

PWA que reúne en un solo lugar todas mis herramientas publicadas en GitHub.
Al abrirla consulta mis repositorios y muestra las nuevas con la etiqueta
**Nuevo**, sin tener que actualizar nada a mano.

## Puesta en marcha

1. Sube esta carpeta a un repositorio y activa **GitHub Pages** (Settings → Pages).
2. Abre la URL e instálala ("Instalar app" / "Agregar a pantalla de inicio").
3. En ⚙ escribe tu usuario de GitHub (y, si quieres, un topic para filtrar).
4. En el repo: **Settings → Social preview → Upload** y sube `assets/social-preview.png`.
5. En `index.html`, cambia `og:image` por la URL absoluta de esa imagen.

## Estructura

```
resq-suite/
├── index.html              Estructura de la página (sin lógica)
├── manifest.webmanifest    Datos de instalación de la PWA
├── sw.js                   Service worker (modo sin conexión)
├── assets/
│   ├── logo.png            Sello de marca (encabezado y bienvenida)
│   ├── social-preview.png  Imagen 1280x640 para GitHub / redes
│   └── icons/              Iconos de la PWA
├── css/
│   ├── variables.css       Paleta y medidas (cambiar colores aquí)
│   ├── base.css            Reset y estilos globales
│   ├── layout.css          Encabezado, filtros y rejilla
│   ├── components.css      Botones, tarjetas, chips, inputs
│   ├── overlays.css        Diálogos (ajustes y apoyo)
│   └── splash.css          Animación del sello de bienvenida
└── js/
    ├── main.js             Punto de entrada (conecta todo)
    ├── config.js           Constantes (correo, claves, tiempos)
    ├── content.js          Textos: bienvenida y nota de apoyo
    ├── services/
    │   ├── storage.js      localStorage/sessionStorage seguros
    │   └── github.js       Llamadas a la API de GitHub
    ├── state/
    │   └── store.js        Estado, acciones y selectores
    └── ui/                 Componentes visuales
        ├── dom.js          Helpers del DOM
        ├── header.js       Buscador, chips y estado
        ├── grid.js         Tarjetas
        ├── settings-dialog.js
        ├── support-dialog.js
        └── splash.js
```

## Flujo de datos

`acción (store.js)` → `estado` → `render (main.js)` → `componentes de ui/`

Los componentes de `ui/` no conocen el store: reciben datos y callbacks.
Los servicios (`services/`) no conocen la UI. Cada capa se puede cambiar sin romper las demás.

## Mantenimiento

- Cambiar textos de la nota de apoyo o bienvenida → `js/content.js`
- Cambiar correo o tiempos → `js/config.js`
- Cambiar colores → `css/variables.css`
- Al agregar/renombrar archivos: actualizar `APP_SHELL` y `CACHE_NAME` en `sw.js`
