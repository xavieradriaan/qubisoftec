# Sitio web de Qubisoft

Página estática de portafolio que presenta las cuatro aplicaciones desarrolladas:
**Orion ERP**, **Orion Biometría**, **Contabilízate** y **Orion Facturación**.

Hereda el sistema de diseño de Orion ERP y Orion Biometría: púrpura `#7c3aed`,
tema oscuro por defecto, tipografía Inter y JetBrains Mono, iconos Heroicons.

---

## Cómo verlo

Doble clic en `index.html`. Eso es todo — no hay servidor, ni compilación, ni
dependencias que instalar. Funciona igual sin conexión a internet, así que
puedes comprimir la carpeta y enviarla por correo.

---

## Estructura

```
qubisoft-web/
├── index.html              Toda la página: contenido, maquetas y sprite de iconos
├── assets/
│   ├── styles.css          Tokens de color, temas claro/oscuro y componentes
│   ├── main.js             Tema, menú móvil, contadores y año del pie
│   ├── favicon.svg         Icono de pestaña
│   ├── logo-qubisoft.svg   Isotipo (por si lo necesitas suelto: firmas, redes)
│   └── fonts/              Inter y JetBrains Mono en .woff2, auto-alojadas
└── README.md
```

---

## Qué editar

| Quiero cambiar… | Está en… |
|---|---|
| Textos, títulos, bullets de cada producto | `index.html`, secciones `#producto-1` … `#producto-4` |
| El índice de productos (las tarjetas 01–04) | `index.html`, lista `.pindex` |
| Estado de un producto (En producción / Prototipo) | `index.html`, la píldora dentro de `.product__bar` |
| Las cifras de la banda de métricas | `index.html`, `.metrics__grid` — cambia el `data-count` **y** el texto visible |
| El año (copyright y órdenes de trabajo) | **No se toca:** se actualiza solo. Ver abajo |
| Las capturas del ERP | `assets/capturas/` — ver «Las capturas» más abajo |
| Las empresas del muro | `index.html`, lista `.clients` |
| Velocidad del realce del muro | `assets/main.js`, `initSpotlight()` → `var STEP = 2500` |
| Los logos de la pasarela | `index.html`, listas `.marquee__group` (**hay dos, cámbialas iguales**) |
| Velocidad de la pasarela | `assets/styles.css`, `.marquee__track` → `animation: … 46s …` |
| Correo, WhatsApp y ubicación | `index.html`, sección `#contacto` |
| Colores de marca | `assets/styles.css`, bloque `:root` |
| Color de acento de cada producto | `assets/styles.css`, clases `.acc-erp`, `.acc-bio`, `.acc-fin`, `.acc-doc` |
| Tema por defecto | El script en el `<head>` de `index.html` |
| Preguntas frecuentes | `index.html`, sección `#faq` |

Los colores están declarados una sola vez como variables CSS. Cambiar
`--p-600` cambia la marca en toda la página.

**Ojo con la pasarela de logos:** la lista de plataformas está escrita **dos veces**
en el HTML (la segunda copia lleva `aria-hidden="true"`). Es lo que hace que el
bucle no dé un salto al reiniciarse. Si añades o quitas un logo, hazlo en las dos
listas o el giro quedará descuadrado.

---

## Las capturas del ERP

La ficha de Orion ERP muestra once imágenes: ocho pantallas reales del sistema
(sacadas del video `DEMO ORION-ERP.mov`) y tres fotografías de una obra en
ejecución. **El video no se publica**: pesaba 91 MB, más de ochenta veces el
sitio entero. Está guardado en `Documents/DEMO ORION-ERP.mov`, fuera de esta
carpeta, como copia maestra.

Cada captura pasó por tres pasos antes de entrar aquí:

1. **Recorte del cromo del navegador**, que mostraba «Not Secure» y la IP interna
   del servidor (`100.101.109.81`).
2. **Mosaico sobre los datos identificables**: el bloque de usuario conectado
   (nombre y `rllerena@citellsa.com`, que salía en todos los fotogramas), los
   nombres de personas que aparecían como solicitante o creador, y el nombre de
   la empresa cliente. Se usó mosaico y no desenfoque porque destruye la
   información de verdad en lugar de solo disimularla.
3. **Tres tamaños por pantalla**: `nombre.jpg` (1440 px, para el visor),
   `nombre-mini.jpg` (760 px, la imagen destacada) y `nombre-t.jpg` (260 px,
   la tira de miniaturas). Las ocho pantallas suman unos 890 KB.

**Si cambias una captura**, revisa que no reaparezcan esos datos: el video
original los tiene en todos los fotogramas.

**Las tres fotos de obra** (`obra-estructura`, `obra-montaje`, `obra-losa`)
son distintas: no son interfaz del sistema, así que no llevan mosaico —fue
decisión explícita de Adrián no difuminar a las personas que aparecen—.
Dos de las tres venían verticales; se recortaron al centro con el mismo
marco 1440:760 de las capturas de software solo para la miniatura destacada
y la tira, así la rejilla no cambia de tamaño al pasar de una pantalla a una
foto. El visor grande muestra la foto completa, sin ese recorte. Los
originales (2-3 MB cada uno) están en
`Documents/fotos-obra-originales/`, fuera de esta carpeta.

## Las capturas de Contabilízate

Mismo tratamiento, mismo componente (`.shots` / `.shots__strip` / visor),
para la ficha de Contabilízate: ocho pantallas reales — inicio de sesión,
panel de control, registro de ingresos, tipo de egreso, registro de egresos,
categorías de gasto, suscripciones IA y verificación en dos pasos — sacadas
de `DEMO CONTABILIZATE.mov`, guardado fuera de esta carpeta en
`Documents/DEMO CONTABILIZATE.mov`.

A diferencia del ERP, esta app es de **finanzas personales**, así que el
video usa la cuenta real de Adrián, no una base de pruebas. Dos zonas se
trataron antes de publicar:

1. **El nombre de usuario del login**, en texto claro — tapado con el mismo
   mosaico destructivo del ERP.
2. **La barra de captura de pantalla nativa de macOS**, que quedó visible en
   el último fotograma del video. A diferencia del cromo del navegador del
   ERP (que se recortaba), aquí se rellenó con el color real del fondo de la
   app: como es un fondo oscuro liso, un mosaico se habría visto como un
   parche, mientras que el relleno sólido se integra sin dejar rastro.

El recordatorio de pagos y las categorías de gasto que aparecen en pantalla
("Maestría", "Claude Code", "Mami", montos de ejemplo) **no se tocaron**: no
identifican a nadie más que a Adrián, y así se decidió con él.

**Diseño de la tira**: la ficha de Contabilízate usa el layout compacto del
sitio (`.product--compact`), con una columna de arte bastante más angosta que
la del ERP. Con las 4 columnas estándar cada miniatura habría quedado casi
ilegible, así que `.product--compact .shots__strip` la reduce a 2 columnas.

Las ocho pantallas suman unos 530 KB (tres tamaños cada una, igual que el ERP).

## `initShots()` ahora soporta varias galerías

En `assets/main.js`, la función dejó de estar atada a un único `#shots` /
`#viewer`. Ahora `initGaleria(containerId, pantallas)` puede llamarse una vez
por producto — hoy hay dos, `shots` (ERP) y `shots-contab` (Contabilízate) —
y todas comparten el mismo `<dialog id="viewer">`. Si añades una galería a
otro producto:

1. Duplica el bloque `<figure class="shots" id="shots-...">` del HTML con un
   id nuevo y sus propias imágenes en `assets/capturas/`.
2. Añade una llamada más a `initGaleria('shots-...', [...])` dentro de
   `initShots()`, con la lista de pantallas de ese producto.

No hace falta tocar el `<dialog>` ni sus controles: son compartidos.

## El año se actualiza solo

No hay que tocarlo en enero. Cualquier elemento marcado con `data-year` en el
HTML se rellena con el año en curso al abrir la página:

- El aviso de copyright del pie.
- Los códigos de orden de trabajo de la maqueta del ERP (`OT-2026-00184`), que
  de otro modo quedarían anclados a un año viejo y harían ver la demo desactualizada.

Si añades otro lugar donde deba aparecer el año, basta con envolverlo así:

```html
© <span data-year>2026</span> Qubisoft
```

El año escrito dentro del `<span>` es solo un respaldo por si el JavaScript no
llega a ejecutarse; en condiciones normales se reemplaza antes de que la página
termine de cargar.

## De dónde salen las cifras de la banda

Las tres están contadas sobre el código de los proyectos, no estimadas. Si un
cliente pregunta, tienes con qué responder:

| Cifra | Qué cuenta | Desglose |
|---|---|---|
| **216** | Componentes de interfaz | 174 ERP · 22 Biometría · 19 Contabilízate · 1 Facturación |
| **6** | Módulos del ERP integrados en un flujo | ventas, proyectos, compras, inventario, aprobaciones, documental |
| **121** | Signals de Django que automatizan avisos | 38 compras · 36 proyectos · 22 inventario · 18 ventas · 7 core |

Otras cifras reales por si quieres cambiar alguna: **145** endpoints de API,
**54** pantallas de usuario, **40** modelos de datos.

Al editarlas hay que cambiar **dos cosas** en `index.html`: el atributo
`data-count` (el destino del conteo animado) y el texto que se ve. Si solo
cambias uno, la cifra salta al valor viejo al terminar la animación.

## Antes de enviárselo a un cliente

Tres cosas que conviene revisar:

1. **Datos de contacto.** El correo `info@qubisoft.com` y el teléfono
   `+593 99 489 4984` se tomaron del membrete de Orion Facturación.
   Confirma que siguen siendo los correctos.

2. **Los logotipos del muro de empresas.** El rótulo dice *«Empresas donde hemos
   implementado sistemas»* y el subtítulo aclara que se participó **como parte
   del equipo de desarrollo** — no como contratista directo. Es la redacción
   que corresponde a la relación real; no la cambies por «Clientes» salvo que
   efectivamente hayas facturado tú a esa empresa.

   Aparte de eso: aunque la experiencia sea cierta, varias de estas
   organizaciones —Banco Bolivariano y Arca Continental sobre todo— exigen
   **autorización escrita** para que un tercero use su logotipo con fines
   comerciales. Conviene pedirla antes de publicar el sitio en un dominio
   público. Para enviarlo por correo a un prospecto concreto el riesgo es
   mucho menor, pero existe.

   CITELL S.A. aparece nombrado tanto en el muro como en el caso destacado.
   Si prefieres volver a anonimizarlo, hay que cambiarlo en los dos sitios:
   el `<h2>` de `#caso` y la celda `.client--citell`.

3. **Lo que no prometemos.** El texto evita a propósito insinuar cosas que las
   apps todavía no hacen: integración con el SRI, facturación electrónica, OCR,
   inteligencia artificial, detección de vida (*liveness*) en el reconocimiento
   facial o integración con nómina. Si añades funciones al copy, verifica antes
   que existan de verdad.

4. **La pasarela de plataformas dice «compatible», no «tenemos experiencia».**
   El titular es *«Desplegamos donde tú ya estés»* y el argumento es la
   portabilidad: el stack va en contenedores, así que corre en cualquiera de las
   doce. Debajo, una línea aclara en cuáles hay sistemas tuyos corriendo hoy:
   **AWS** (Orion ERP), **DigitalOcean** (Orion Biometría) y **Railway**
   (Contabilízate) — las tres verificadas en el código. Si algún día despliegas
   en Azure, GCP u Oracle, súmalas a esa línea. Mientras tanto, no la toques:
   afirmar experiencia que no tienes se cae en la primera reunión técnica.

5. **Orion Facturación aparece como «Prototipo funcional»**, no como «En
   producción». Es lo correcto: `facturas/backend/config/settings.py` tiene
   `DEBUG = True`, `SECRET_KEY` de desarrollo, SQLite y la API sin
   autenticación. Cuando lo endurezcas y lo despliegues, cambia la píldora.

---

## Publicarlo en internet

Cualquiera de estas opciones sirve, todas gratuitas:

- **Netlify Drop** — entra a `app.netlify.com/drop` y arrastra la carpeta
  `qubisoft-web`. Te da una URL en segundos. Es la vía más rápida.
- **GitHub Pages** — sube la carpeta a un repositorio y activa Pages sobre la
  rama principal, carpeta raíz.
- **Vercel** — `vercel deploy` desde esta carpeta, sin configuración.
- **Tu propio hosting** — copia los archivos por FTP. No necesita PHP,
  Node ni base de datos.

Si compras un dominio (por ejemplo `qubisoft.com`), las tres primeras opciones
permiten conectarlo con certificado HTTPS incluido.

---

## Notas técnicas

- **Peso total ≈ 2,6 MB**: 2,2 MB en `assets/capturas/` (890 KB del ERP + 710 KB de fotos de obra + 530 KB de Contabilízate), 208 KB de fuentes y el resto
  el HTML, el CSS, el JS, los iconos y los nueve logotipos del muro de empresas.
- **Los logotipos del muro son máscaras, no imágenes.** Cada uno se guardó como
  un PNG que solo lleva canal alfa, incrustado en `styles.css` como `data:` URI.
  El CSS lo usa con `mask-image` y lo rellena con `currentColor`, así que la
  silueta toma el color del sitio y cambia sola entre tema claro y oscuro. Si
  añades una empresa, hay que generar su máscara igual: recortar el fondo,
  dejar solo el alfa y escalarla a un área de tinta parecida a las demás para
  que ninguna pese ópticamente más que el resto.
- **Cero peticiones externas.** Las fuentes están dentro de la carpeta y todos
  los iconos —incluidos los logos de AWS, Azure, Docker y compañía— van
  incrustados como SVG dentro del propio `index.html`. Nada se carga desde un
  CDN, así que la página no depende de terceros ni filtra visitas a otros
  servicios. Los logos provienen de la colección Simple Icons (CC0); las marcas
  siguen siendo de sus titulares y por eso el aviso al pie de la pasarela.
- **Sin formulario de contacto.** Un sitio estático no puede procesar envíos;
  los botones usan `mailto:` y `wa.me`, que abren el cliente de correo o
  WhatsApp directamente. Si más adelante quieres un formulario, Netlify Forms
  o Formspree lo resuelven sin cambiar de stack.
- **Accesibilidad.** Contraste AA en ambos temas, navegación por teclado, enlace
  para saltar al contenido y respeto por `prefers-reduced-motion`.
- **Las capturas son maquetas.** Las pantallas que se ven son recreaciones en
  HTML y CSS con datos inventados, no capturas de sistemas reales. Cuando
  quieras sustituirlas por capturas de verdad, cada una vive dentro de un
  contenedor `.product__art` o `.hero__art` y se reemplaza por un `<img>`.
