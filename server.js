/* =========================================================================
   Qubisoft — servidor del sitio.

   El sitio sigue siendo estático: `index.html` se abre con doble clic y
   funciona sin conexión, igual que antes. Este servidor solo hace falta en el
   despliegue (Railway), y existe por un único motivo: el contador público de
   visitas del pie necesita un número compartido por todos los visitantes, y
   eso obliga a guardar estado en algún sitio.
   ========================================================================= */
'use strict';

var express = require('express');
var fs = require('fs');
var path = require('path');

/* ---------- LÍNEA BASE DEL CONTADOR — LÉEME ----------------------------
   1171 = visitas que el sitio ya acumulaba ANTES de que este contador
   existiera (medidas con Cloudflare Web Analytics). El contador arrancó el
   15 de agosto de 2026.

   El archivo del Volume guarda SOLO las visitas contadas desde esa fecha.
   Lo que se muestra al público es BASELINE + count, así que el primer
   visitante real vio 1172.

   Si algún día se pierde el Volume, el número reinicia desde 1171 — nunca
   desde 0. Por eso conviene no tocar esta constante: es memoria histórica,
   no un ajuste de presentación.
   ---------------------------------------------------------------------- */
var BASELINE = 1171;

var PORT = process.env.PORT || 3000;

// En Railway se monta un Volume en /data. En local se pasa DATA_DIR para no
// tener que crear esa carpeta en la raíz del disco.
var DATA_DIR = process.env.DATA_DIR || '/data';
var DATA_FILE = path.join(DATA_DIR, 'views.json');

/* ---------- Estado del contador ----------
   El conteo vive en memoria y se refleja en disco. Si el disco falla, el
   sitio sigue en pie: `persistible` pasa a false y el contador se comporta
   como un número en memoria que se reinicia con cada despliegue. Un
   contador es un adorno del pie; no puede tumbar la página. */
var count = 0;
var persistible = true;

function cargarConteo() {
  /* Dos comprobaciones distintas, a propósito. Si se hacen juntas, el caso
     «el Volume no está montado» y el caso «primer arranque, aún no hay
     archivo» llegan los dos como ENOENT y se confunden: el servidor anunciaría
     que va a guardar en un sitio donde no puede escribir, y el aviso no
     aparecería hasta la primera visita. Conviene saberlo al arrancar. */
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.accessSync(DATA_DIR, fs.constants.W_OK);
  } catch (e) {
    persistible = false;
    console.warn(
      '[visitas] No se puede escribir en ' + DATA_DIR + ' (' + e.code + '). ' +
      'El contador seguirá funcionando en memoria, pero se reiniciará a ' +
      BASELINE + ' en cada despliegue. ¿Está montado el Volume en ' + DATA_DIR + '?'
    );
    return;
  }

  try {
    var guardado = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).count;
    if (typeof guardado === 'number' && isFinite(guardado) && guardado >= 0) {
      count = Math.floor(guardado);
    }
  } catch (e) {
    // Que el archivo no exista es lo normal en el primer arranque: lo creará
    // la primera visita. Cualquier otra cosa (JSON corrupto) sí merece aviso,
    // porque significa perder la cuenta acumulada.
    if (e.code !== 'ENOENT') {
      console.warn('[visitas] ' + DATA_FILE + ' ilegible (' + e.message + '). Se recuenta desde ' + BASELINE + '.');
    }
  }
}

/* Escritura atómica: se escribe a un temporal y se renombra. `rename` es
   atómico dentro del mismo sistema de archivos, así que un corte de luz a
   mitad de la escritura deja el archivo anterior intacto en vez de dejar un
   JSON truncado que no se podría volver a leer. */
function guardarConteo() {
  if (!persistible) return;
  var tmp = DATA_FILE + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify({ count: count }));
    fs.renameSync(tmp, DATA_FILE);
  } catch (e) {
    persistible = false;
    console.warn('[visitas] Fallo al guardar el conteo (' + e.code + '). Se sigue contando en memoria.');
  }
}

cargarConteo();

var app = express();

/* ---------- Contador de visitas ----------
   Es POST y no GET a propósito. Los rastreadores, los prefetchers del
   navegador y los previsualizadores de enlaces hacen GET, nunca POST: si
   esto fuera un GET, el número subiría solo cada vez que Google indexara el
   sitio o alguien pegara el enlace en WhatsApp.

   No se guarda IP, ni user-agent, ni nada del visitante: solo un entero.
   Por eso sigue siendo cierto lo que dice el pie («no rastrea a sus
   visitantes») y lo que dice el aviso de privacidad. */
app.post('/api/views', function (req, res) {
  count++;
  guardarConteo();
  // Sin caché: si un intermediario guardara esta respuesta, todos verían
  // congelado el mismo número.
  res.set('Cache-Control', 'no-store');
  res.json({ views: BASELINE + count });
});

/* ---------- Archivos del sitio ----------
   Servir la carpeta entera sería un error: en la raíz del repositorio conviven
   con el sitio cosas que NO son públicas — `README.md` (que documenta detalles
   internos de los sistemas), `.git/` con todo el historial, `node_modules/` y
   este mismo archivo.

   Por eso se declara qué es público en vez de qué está prohibido: una lista de
   prohibidos hay que acordarse de ampliarla cada vez que se añade un archivo
   al repositorio, y basta olvidarlo una vez para publicarlo sin querer. Con
   esta lista, lo que se añada mañana en la raíz nace privado. */
var PUBLICO = /^\/(assets\/|en\/|index\.html$|$)/;

app.use(function (req, res, next) {
  var ruta;
  // La ruta hay que decodificarla y normalizarla ANTES de compararla. Si se
  // compara en crudo, `/assets/../README.md` empieza por `/assets/` y pasa el
  // filtro; después `express.static` la resuelve a `/README.md` y sirve el
  // archivo. Lo mismo con `..` escrito como `%2e%2e`. Se compara, entonces,
  // la ruta ya resuelta: la misma que acabará abriendo el disco.
  try {
    ruta = path.posix.normalize(decodeURIComponent(req.path));
  } catch (e) {
    return res.status(400).type('txt').send('Petición inválida');
  }
  if (PUBLICO.test(ruta)) return next();
  res.status(404).type('txt').send('No encontrado');
});

// `express.static` resuelve index.html en / y en /en/ por sí solo.
app.use(express.static(__dirname));

app.listen(PORT, function () {
  console.log('Qubisoft en http://localhost:' + PORT);
  console.log('[visitas] Mostrando ' + (BASELINE + count) + ' (base ' + BASELINE + ' + ' + count + ' contadas)' +
    (persistible ? ' · guardando en ' + DATA_FILE : ' · SOLO EN MEMORIA'));
});
