/* =========================================================================
   Qubisoft — comportamiento del sitio.
   Sin dependencias: el sitio debe funcionar abierto con doble clic y sin red.
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Tema claro / oscuro ----------
     El tema inicial ya se aplicó en el <head> para evitar el destello.
     Aquí solo se gestiona el cambio manual y su persistencia. */
  function initTheme() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('qubisoft_theme', next);
      } catch (e) {
        /* Modo privado o almacenamiento bloqueado: el tema cambia igual,
           solo no se recuerda entre visitas. */
      }
    });
  }

  /* ---------- Menú de navegación en móvil ---------- */
  function initMobileNav() {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!nav || !toggle || !links) return;

    function setOpen(open) {
      if (open) {
        nav.setAttribute('data-open', '');
      } else {
        nav.removeAttribute('data-open');
      }
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.hasAttribute('data-open'));
    });

    // Al tocar un enlace, el menú estorba: se cierra solo.
    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.hasAttribute('data-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Contadores de la banda de métricas ---------- */
  function initCounters() {
    var band = document.getElementById('metrics');
    if (!band) return;

    var numbers = band.querySelectorAll('.num');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sin IntersectionObserver o con movimiento reducido, los valores ya están
    // escritos en el HTML: no hay nada que hacer.
    if (reduced || !('IntersectionObserver' in window)) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var stepMs = 55;               // ritmo "mecánico": salta, no se desliza
      // Pasos proporcionales a la magnitud: una cifra de tres dígitos necesita
      // recorrido para que se vea subir; una de un dígito, no.
      var steps = Math.min(28, Math.max(12, Math.round(target / 8)));
      var tick = 0;

      var timer = setInterval(function () {
        tick++;
        var progress = Math.min(tick / steps, 1);
        var eased = 1 - Math.pow(1 - progress, 2); // easeOutQuad: cae rápido, frena
        el.textContent = (target * eased).toFixed(decimals);
        if (progress >= 1) {
          clearInterval(timer);
          el.textContent = target.toFixed(decimals);
          // Pequeño rebote al aterrizar en el valor real.
          el.classList.add('num--landed');
        }
      }, stepMs);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animate(entry.target);
      });
    }, { threshold: 0.6 });

    // El HTML trae el valor final escrito, para que la cifra correcta se vea
    // aunque el JS no llegue a correr. Como aquí sí corre, se baja el número de
    // entrada: si no, al entrar en pantalla se vería el valor final un instante
    // antes de saltar al inicio del conteo.
    //
    // No hay temporizador de reserva a propósito: uno anterior restituía la cifra
    // a los 8 s y dejaba de observar, de modo que quien tardaba más de ese tiempo
    // en bajar hasta aquí encontraba el número ya fijo, sin conteo. Si el
    // observador no llega a dispararse es porque la banda nunca entró en pantalla,
    // y entonces nadie la está mirando.
    numbers.forEach(function (el) {
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      // La cifra real queda en aria-label: los lectores de pantalla anuncian el
      // valor correcto aunque el texto visible esté a mitad del conteo.
      el.setAttribute('aria-label', el.getAttribute('data-count'));
      el.textContent = (0).toFixed(decimals);
      observer.observe(el);
    });
  }

  /* ---------- Muro de empresas: el realce va saltando de celda ----------
     Recorrido secuencial, no aleatorio: el ojo predice el ritmo y el efecto
     resulta calmado en vez de nervioso. */
  function initSpotlight() {
    var wall = document.getElementById('clients');
    if (!wall) return;

    var cells = wall.querySelectorAll('.client');
    if (!cells.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var STEP = 2500;
    var index = -1;
    var timer = null;
    var hovering = false;
    var visible = true;

    function advance() {
      if (index >= 0) cells[index].classList.remove('is-lit');
      index = (index + 1) % cells.length;
      cells[index].classList.add('is-lit');
    }

    function start() {
      if (timer || hovering || !visible) return;
      timer = setInterval(advance, STEP);
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    // Mientras el ratón está encima, la celda señalada es la que el usuario
    // mira; el recorrido automático estorbaría.
    wall.addEventListener('pointerenter', function () {
      hovering = true;
      stop();
      if (index >= 0) cells[index].classList.remove('is-lit');
    });
    wall.addEventListener('pointerleave', function () {
      hovering = false;
      start();
    });

    // Una animación corriendo en una pestaña que nadie mira solo gasta batería.
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      if (visible) start(); else stop();
    });

    // Tampoco tiene sentido recorrerlo mientras está fuera de pantalla.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { advance(); start(); } else { stop(); }
        });
      }, { threshold: 0.25 }).observe(wall);
    } else {
      advance();
      start();
    }
  }

  /* ---------- Capturas del sistema ----------
     La tira cambia la imagen destacada; al pulsar la imagen se abre el visor.
     El visor es un <dialog> nativo y único: lo comparten todas las galerías
     de la página (una por producto), cada una con su propia lista de
     pantallas. Escape y el clic fuera los gestiona el navegador. */
  function initShots() {
    var viewer = document.getElementById('viewer');
    if (!viewer) return;

    var vImg = document.getElementById('viewer-img');
    var vCap = document.getElementById('viewer-cap');
    var vNum = document.getElementById('viewer-num');
    var conDialog = typeof viewer.showModal === 'function';

    // Qué galería está abierta en el visor ahora mismo (null si está cerrado).
    var abierta = null;

    function refrescarVisor() {
      var p = abierta.pantallas[abierta.actual];
      vImg.src = p.full;
      vImg.alt = p.cap;
      vCap.textContent = p.cap;
      vNum.textContent = (abierta.actual + 1) + ' / ' + abierta.pantallas.length;
    }

    function moverVisor(delta) {
      if (!abierta) return;
      abierta.actual = (abierta.actual + delta + abierta.pantallas.length) % abierta.pantallas.length;
      abierta.destacar(abierta.actual);
      refrescarVisor();
    }

    // Los controles del visor se conectan una sola vez: no dependen de cuál
    // de las galerías esté abierta, actúan sobre "abierta".
    if (conDialog) {
      document.getElementById('viewer-prev').addEventListener('click', function () { moverVisor(-1); });
      document.getElementById('viewer-next').addEventListener('click', function () { moverVisor(1); });
      document.getElementById('viewer-close').addEventListener('click', function () { viewer.close(); });

      viewer.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); moverVisor(1); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); moverVisor(-1); }
      });

      // Clic en el fondo oscuro: el <dialog> ocupa toda la pantalla, así que
      // se comprueba que el punto pulsado quede fuera de la tarjeta.
      viewer.addEventListener('click', function (e) {
        var caja = viewer.querySelector('.viewer__inner').getBoundingClientRect();
        var fuera = e.clientX < caja.left || e.clientX > caja.right ||
                    e.clientY < caja.top  || e.clientY > caja.bottom;
        if (fuera) viewer.close();
      });
    }

    // Instancia una galería (tira + destacada) dentro del contenedor indicado
    // y la conecta al visor compartido. Las rutas y leyendas se leen del
    // propio HTML (miniatura + data-cap), no de una lista aparte en el JS:
    // así cada idioma trae sus leyendas en su propia página, y las rutas
    // funcionan igual desde la raíz que desde en/, porque img.src ya viene
    // resuelto por el navegador a una URL absoluta.
    function initGaleria(containerId) {
      var shots = document.getElementById(containerId);
      if (!shots) return;

      var mainBtn = shots.querySelector('.shots__main');
      var mainImg = shots.querySelector('.shots__img');
      var mainCap = shots.querySelector('.shots__cap');
      var tabs = shots.querySelectorAll('.shots__strip button');
      var actual = 0;

      var pantallas = [];
      for (var i = 0; i < tabs.length; i++) {
        var thumb = tabs[i].querySelector('img');
        pantallas.push({
          mini: thumb.src.replace(/-t\.jpg$/, '-mini.jpg'),
          full: thumb.src.replace(/-t\.jpg$/, '.jpg'),
          cap:  tabs[i].getAttribute('data-cap') || thumb.alt
        });
      }

      function destacar(i) {
        actual = (i + pantallas.length) % pantallas.length;
        var p = pantallas[actual];
        mainImg.src = p.mini;
        mainImg.alt = p.cap;
        mainCap.textContent = p.cap;
        for (var i2 = 0; i2 < tabs.length; i2++) {
          tabs[i2].setAttribute('aria-selected', String(i2 === actual));
        }
      }

      for (var i = 0; i < tabs.length; i++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            destacar(parseInt(btn.getAttribute('data-i'), 10));
          });
        })(tabs[i]);
      }

      // Sin <dialog> (navegadores antiguos) el botón no hace nada raro: se
      // deja como está y la tira sigue funcionando.
      if (!conDialog) return;

      mainBtn.addEventListener('click', function () {
        abierta = { pantallas: pantallas, actual: actual, destacar: destacar };
        refrescarVisor();
        viewer.showModal();
      });
    }

    initGaleria('shots');
    initGaleria('shots-contab');
    initGaleria('shots-fact');
  }

  /* ---------- Año en curso ----------
     Rellena cualquier elemento marcado con `data-year`: el aviso de copyright
     del pie y los códigos de orden de trabajo de las maquetas. Así el sitio no
     necesita mantenimiento anual. El HTML trae un año escrito como respaldo,
     por si el JS no llegara a ejecutarse. */
  function initYear() {
    var year = String(new Date().getFullYear());
    var nodes = document.querySelectorAll('[data-year]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = year;
    }
  }

  /* ---------- Analítica de visitas ----------
     Cloudflare Web Analytics: gratuita y sin cookies. Según su documentación no
     usa cookies ni localStorage ni huella digital del visitante, así que no
     hace falta pedir consentimiento — por eso este sitio no lleva el típico
     banner de cookies: no hay nada que consentir.

     El beacon SOLO se inyecta si hay token. Mientras esté vacío, el sitio
     conserva su propiedad de cero peticiones externas, y abierto sin conexión
     (el ZIP por correo) no intenta cargar nada. Para activarlo, pega aquí el
     token que da el panel de Cloudflare; no hay que tocar nada más.

     El token no es secreto: viaja visible en el HTML de cualquier sitio que
     use este mismo servicio, igual que el ID de medición de Google Analytics.
     Solo identifica a qué sitio pertenecen los datos, no autoriza nada más. */
  var CF_TOKEN = '26413ba3165a49d29fbe3fa259bb0640';

  function initAnalytics() {
    if (!CF_TOKEN) return;
    var s = document.createElement('script');
    s.type = 'module';   // mismo atributo que entrega el panel de Cloudflare
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', '{"token": "' + CF_TOKEN + '"}');
    document.body.appendChild(s);
  }

  /* ---------- Aviso de privacidad ----------
     Mismo patrón que el visor de capturas: <dialog> nativo, así Escape y el
     foco los gestiona el navegador. */
  function initPrivacidad() {
    var dlg = document.getElementById('privacidad');
    var abrir = document.getElementById('privacidad-abrir');
    if (!dlg || !abrir) return;

    // Sin <dialog> (navegadores antiguos) el enlace no hace nada raro: se deja
    // que el navegador salte al ancla y el contenido igual queda accesible.
    if (typeof dlg.showModal !== 'function') return;

    abrir.addEventListener('click', function (e) {
      e.preventDefault();
      dlg.showModal();
    });

    var cerrar = document.getElementById('privacidad-cerrar');
    if (cerrar) cerrar.addEventListener('click', function () { dlg.close(); });

    // Clic en el fondo oscuro: el <dialog> ocupa toda la pantalla, así que se
    // comprueba que el punto pulsado quede fuera de la tarjeta.
    dlg.addEventListener('click', function (e) {
      var caja = dlg.querySelector('.aviso__inner').getBoundingClientRect();
      var fuera = e.clientX < caja.left || e.clientX > caja.right ||
                  e.clientY < caja.top  || e.clientY > caja.bottom;
      if (fuera) dlg.close();
    });
  }

  initTheme();
  initMobileNav();
  initCounters();
  initSpotlight();
  initShots();
  initYear();
  initPrivacidad();
  initAnalytics();
})();
