/* ================================================================
   KHANERIAH — script.js
   Índice de secciones:
     1.  Starfield canvas (cielo estrellado animado)
     2.  Navbar scroll effect (glassmorphism al hacer scroll)
     3.  Menú hamburger móvil
     4.  Reveal on scroll (animaciones de entrada con IntersectionObserver)
     5.  Active nav link (resalta el link del menú según la sección visible)
     6.  Newsletter form (validación y feedback visual)
     7.  Parallax del hero con el ratón
     8.  Cursor personalizado (punto neon)
     9.  Glitch effect aleatorio en el título principal
================================================================ */

(() => {
  'use strict'; /* modo estricto: mejora la detección de errores */

  /* ================================================================
     1. STARFIELD CANVAS — Campo de estrellas animado
        Dibuja estrellas con parpadeo (twinkle), deriva lenta y
        efecto parallax respecto al scroll de la página.
        También genera estrellas fugaces (shooting stars) aleatoriamente.
  ================================================================ */
  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');

  let W, H;         /* dimensiones del canvas */
  let stars = [];   /* array de estrellas normales */
  let shootingStars = []; /* array de estrellas fugaces activas */

  /* Ajusta el canvas al tamaño de la ventana */
  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* Genera el array de estrellas.
     La densidad depende del área de la pantalla (1 estrella cada 3000px²). */
  function initStars() {
    stars = [];
    const count = Math.floor((W * H) / 3000);

    for (let i = 0; i < count; i++) {
      stars.push({
        x:      Math.random() * W,
        y:      Math.random() * H,
        r:      Math.random() * 1.4 + 0.2,    /* radio entre 0.2 y 1.6 px */
        alpha:  Math.random(),                  /* brillo inicial aleatorio */
        dAlpha: (Math.random() * 0.006 + 0.001) * (Math.random() < 0.5 ? 1 : -1), /* velocidad de parpadeo */
        speed:  Math.random() * 0.08 + 0.01,   /* velocidad de deriva horizontal */
        layer:  Math.floor(Math.random() * 3),  /* capa 0, 1 o 2 (para parallax y color) */
      });
    }
  }

  /* Crea una estrella fugaz que aparece en la mitad superior de la pantalla */
  function spawnShootingStar() {
    shootingStars.push({
      x:     Math.random() * W,
      y:     Math.random() * H * 0.5,
      len:   Math.random() * 120 + 60,  /* longitud de la estela */
      speed: Math.random() * 8 + 4,     /* velocidad de desplazamiento */
      alpha: 1,                          /* brillo inicial (va disminuyendo) */
      angle: Math.PI / 5,               /* ángulo de caída (~36°) */
    });
  }

  /* Variable que almacena el scroll actual para el efecto parallax */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* Bucle principal de animación del starfield */
  function drawStars() {
    ctx.clearRect(0, 0, W, H); /* limpia el canvas en cada frame */

    /* ── Dibujar estrellas normales ── */
    for (const s of stars) {

      /* Parallax: las estrellas de capas más altas se desplazan más rápido con el scroll */
      const pOffset = (scrollY * (s.layer + 1) * 0.04) % H;
      let y = (s.y + pOffset) % H;

      /* Twinkle: el brillo oscila entre 0.05 y 1 */
      s.alpha += s.dAlpha;
      if (s.alpha > 1 || s.alpha < 0.05) s.dAlpha *= -1;
      s.alpha = Math.max(0.05, Math.min(1, s.alpha));

      /* Deriva lenta hacia la izquierda; al salir reaparece por la derecha */
      s.x -= s.speed * 0.3;
      if (s.x < 0) s.x = W;

      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);

      /* Color según la capa:
           capa 0 → blanco puro
           capa 1 → cian tenue
           capa 2 → naranja/ámbar tenue  */
      const tints = [
        `rgba(255,255,255,${s.alpha})`,
        `rgba(180,240,255,${s.alpha})`,
        `rgba(255,200,130,${s.alpha * 0.7})`,
      ];
      ctx.fillStyle = tints[s.layer];
      ctx.fill();
    }

    /* ── Dibujar estrellas fugaces ── */
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const dx = Math.cos(ss.angle) * ss.len;
      const dy = Math.sin(ss.angle) * ss.len;

      /* Gradiente: transparente en la cola, brillante en la punta */
      const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + dx, ss.y + dy);
      grad.addColorStop(0, `rgba(255,200,120,0)`);
      grad.addColorStop(1, `rgba(255,200,120,${ss.alpha})`);

      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x + dx, ss.y + dy);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      /* Avanza en la dirección del ángulo */
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.02; /* se desvanece gradualmente */

      /* Eliminar si ya no es visible */
      if (ss.alpha <= 0 || ss.x > W || ss.y > H) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(drawStars); /* siguiente frame */
  }

  /* Inicialización del canvas + timers de estrellas fugaces */
  function initCanvas() {
    resizeCanvas();
    initStars();
    requestAnimationFrame(drawStars);

    /* Estrella fugaz ocasional cada ~3.2 segundos (70% de probabilidad) */
    setInterval(() => {
      if (Math.random() < 0.7) spawnShootingStar();
    }, 3200);

    /* Ráfaga de 1-3 estrellas fugaces cada ~12 segundos */
    setInterval(() => {
      const n = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < n; i++) {
        setTimeout(spawnShootingStar, i * 280);
      }
    }, 12000);
  }

  /* Recalcular si la ventana cambia de tamaño */
  window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

  /* Arrancar */
  initCanvas();


  /* ================================================================
     2. NAVBAR SCROLL EFFECT
        Añade la clase .scrolled al header cuando el usuario
        ha hecho scroll más de 60px. El CSS define el glassmorphism.
  ================================================================ */
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); /* llamada inicial por si la página carga con scroll */


  /* ================================================================
     3. MENÚ HAMBURGER (MÓVIL)
        Alterna la clase .open en #navLinks para mostrar/ocultar el menú.
        También anima las tres líneas del hamburger → icono ✕.
  ================================================================ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');

    /* Actualiza el atributo de accesibilidad */
    hamburger.setAttribute('aria-expanded', isOpen);

    /* Transforma las líneas en una ✕ cuando el menú está abierto */
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      /* Vuelve al estado de hamburger normal */
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  /* Cerrar el menú al hacer click en cualquier enlace */
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '';
      });
    });
  });


  /* ================================================================
     4. REVEAL ON SCROLL (IntersectionObserver)
        Todos los elementos con clase .reveal empiezan ocultos (CSS).
        Cuando entran en el viewport se les añade .visible,
        que activa la transición de opacidad y translateY.
  ================================================================ */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); /* una vez visible, dejar de observar */
        }
      });
    },
    {
      threshold: 0.12,            /* 12% del elemento debe estar visible */
      rootMargin: '0px 0px -60px 0px' /* activa un poco antes del borde inferior */
    }
  );

  revealEls.forEach(el => revealObserver.observe(el));


  /* ================================================================
     5. ACTIVE NAV LINK
        Resalta el enlace de navegación correspondiente a la sección
        actualmente visible en el viewport.
  ================================================================ */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4 } /* la sección debe ocupar al menos el 40% de la pantalla */
  );

  sections.forEach(s => sectionObserver.observe(s));

  /* Estilos para el link activo (inyectado para no complicar el CSS) */
  const activeStyle = document.createElement('style');
  activeStyle.textContent = `
    .nav-links a.active-link { color: var(--text) !important; }
    .nav-links a.active-link::after { width: 100% !important; }
  `;
  document.head.appendChild(activeStyle);


  /* ================================================================
     6. NEWSLETTER FORM
        Valida el formato del email.
        Si es correcto: muestra feedback verde y limpia el campo.
        Si no: agita el formulario y resalta el borde en rojo.
  ================================================================ */
  const subscribeBtn = document.querySelector('.btn-subscribe');
  const emailInput   = document.querySelector('.newsletter-form input[type="email"]');

  /* Regex básica de validación de email */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (subscribeBtn && emailInput) {

    subscribeBtn.addEventListener('click', () => {
      const val = emailInput.value.trim();

      if (!val || !emailRegex.test(val)) {
        /* Email inválido: animar el formulario */
        shakElement(emailInput.closest('.newsletter-form'));
        return;
      }

      /* Email válido: mostrar confirmación */
      subscribeBtn.textContent   = '✓';
      subscribeBtn.style.background = '#4caf50';
      emailInput.value           = '';
      emailInput.placeholder     = '¡Suscrito con éxito!';

      /* Restaurar el estado original tras 3 segundos */
      setTimeout(() => {
        subscribeBtn.textContent      = '→';
        subscribeBtn.style.background = '';
        emailInput.placeholder        = 'tu@email.com';
      }, 3000);
    });

    /* Permitir enviar con Enter desde el input */
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') subscribeBtn.click();
    });
  }

  /* Animación de sacudida para errores de validación */
  function shakElement(el) {
    el.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 380, easing: 'ease-in-out' }
    );
    /* Borde rojo temporal */
    el.style.borderColor = '#ff4444';
    setTimeout(() => { el.style.borderColor = ''; }, 1200);
  }


  /* ================================================================
     7. PARALLAX DEL HERO CON EL RATÓN
        El fondo del hero (.hero-bg-planet) se desplaza sutilmente
        en la dirección opuesta al cursor, creando profundidad.
        Máximo desplazamiento: ±12px horizontal, ±8px vertical.
  ================================================================ */
  const heroBg = document.querySelector('.hero-bg-planet');

  if (heroBg) {
    document.addEventListener('mousemove', (e) => {
      /* Normalizar posición del cursor: -0.5 a 0.5 */
      const mx = (e.clientX / window.innerWidth  - 0.5) * 12;
      const my = (e.clientY / window.innerHeight - 0.5) * 8;
      heroBg.style.transform = `translate(${mx}px, ${my}px) scale(1.04)`;
    }, { passive: true });
  }


  /* ================================================================
     8. CURSOR PERSONALIZADO — Punto neon + anillo
        Se crean dos divs: un punto pequeño (.cursor-dot) y un anillo
        más grande (.cursor-ring) que siguen al cursor.
        Al pasar sobre elementos interactivos, ambos se agrandan.

        En dispositivos táctiles se ocultan automáticamente.
  ================================================================ */
  const cursorDot = document.createElement('div');
  cursorDot.setAttribute('aria-hidden', 'true');
  cursorDot.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 9999;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--orange);
    box-shadow: 0 0 12px var(--orange-glow), 0 0 24px var(--orange-glow);
    transform: translate(-50%, -50%);
    transition: width 0.2s ease, height 0.2s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(cursorDot);

  const cursorRing = document.createElement('div');
  cursorRing.setAttribute('aria-hidden', 'true');
  cursorRing.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 9998;
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(232, 124, 42, 0.5);
    transform: translate(-50%, -50%);
    transition: left 0.12s ease, top 0.12s ease, width 0.2s ease, height 0.2s ease;
  `;
  document.body.appendChild(cursorRing);

  /* Actualizar posición en cada movimiento del ratón */
  document.addEventListener('mousemove', (e) => {
    /* El punto sigue al instante */
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top  = e.clientY + 'px';
    /* El anillo va ligeramente retrasado (via CSS transition) */
    cursorRing.style.left = e.clientX + 'px';
    cursorRing.style.top  = e.clientY + 'px';
  });

  /* Agrandar cursor sobre elementos interactivos */
  document.querySelectorAll('a, button, .feat-card, .gallery-item, .sprite-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.width   = '14px';
      cursorDot.style.height  = '14px';
      cursorRing.style.width  = '44px';
      cursorRing.style.height = '44px';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.width   = '8px';
      cursorDot.style.height  = '8px';
      cursorRing.style.width  = '28px';
      cursorRing.style.height = '28px';
    });
  });

  /* Ocultar cursor personalizado en dispositivos táctiles */
  if ('ontouchstart' in window) {
    cursorDot.style.display  = 'none';
    cursorRing.style.display = 'none';
  }


  /* ================================================================
     9. GLITCH EFFECT — Título principal
        Con una probabilidad baja, cada 3 segundos se aplica un
        efecto glitch de 150ms al h1 del hero.
        La clase .glitch y su animación se inyectan dinámicamente.
  ================================================================ */
  const heroTitle = document.querySelector('.hero-title');

  if (heroTitle) {
    /* Comprobar aleatoriamente si se activa el glitch */
    setInterval(() => {
      if (Math.random() > 0.75) { /* ~25% de probabilidad cada 3s */
        heroTitle.classList.add('glitch');
        setTimeout(() => heroTitle.classList.remove('glitch'), 150);
      }
    }, 3000);
  }

  /* Estilos del efecto glitch (inyectados para mantenerlos junto a la lógica) */
  const glitchStyle = document.createElement('style');
  glitchStyle.textContent = `
    /* Cuando .glitch está activo: desplazamiento de color y clip-path */
    .hero-title.glitch {
      text-shadow:
        2px  0 var(--cyan),
        -2px 0 var(--orange),
        0 0 40px rgba(232, 124, 42, 0.4);
      animation: glitch-shift 0.12s steps(2) forwards;
    }

    /* La animación recorta el texto en franjas y lo desplaza lateralmente */
    @keyframes glitch-shift {
      0%   { clip-path: inset(0 0 70% 0); transform: translateX(3px);  }
      33%  { clip-path: inset(40% 0 30% 0); transform: translateX(-3px); }
      66%  { clip-path: inset(70% 0 0 0);   transform: translateX(2px);  }
      100% { clip-path: inset(0);            transform: translateX(0);   }
    }
  `;
  document.head.appendChild(glitchStyle);

})(); /* fin del IIFE — evita contaminar el scope global */