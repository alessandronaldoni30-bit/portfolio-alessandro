import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PROJECTS, HERO_IMAGES, ABOUT_IMAGE, SERVICES, CLIENTS, TESTIMONIALS } from '../data/projects';

/* ─── Cursor ──────────────────────────────────────────────────────────────── */
function Cursor() {
  const dot  = useRef(null);
  const ring = useRef(null);
  const pos  = useRef({ x: 0, y: 0 });
  const rp   = useRef({ x: 0, y: 0 });
  const raf  = useRef(null);

  useEffect(() => {
    const move = ({ clientX: x, clientY: y }) => {
      pos.current = { x, y };
      if (dot.current) { dot.current.style.left = x + 'px'; dot.current.style.top = y + 'px'; }
    };
    const tick = () => {
      rp.current.x += (pos.current.x - rp.current.x) * .12;
      rp.current.y += (pos.current.y - rp.current.y) * .12;
      if (ring.current) { ring.current.style.left = rp.current.x + 'px'; ring.current.style.top = rp.current.y + 'px'; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const on  = () => ring.current?.classList.add('grow');
    const off = () => ring.current?.classList.remove('grow');
    document.addEventListener('mousemove', move);
    document.querySelectorAll('a,button,[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
    });
    return () => { document.removeEventListener('mousemove', move); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <>
      <div className="cur-dot"  ref={dot}  />
      <div className="cur-ring" ref={ring} />
    </>
  );
}

/* ─── CountUp (numero che cresce in viewport) ─────────────────────────────── */
function CountUp({ value, duration = 1600 }) {
  const ref = useRef(null);
  const m = String(value).match(/\d+/);
  const [out, setOut] = useState(m ? value.replace(m[0], '0') : value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !m) return;
    const digits = m[0];
    const target = parseInt(digits, 10);
    const pad = digits.length > 1 && digits[0] === '0';
    let started = false;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        const t0 = performance.now();
        const step = now => {
          const p = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const n = Math.round(eased * target);
          const txt = pad ? String(n).padStart(digits.length, '0') : String(n);
          setOut(value.replace(digits, txt));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(e.target);
      }
    }), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]); // eslint-disable-line

  return <span ref={ref}>{out}</span>;
}

/* ─── Reveal hook ─────────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }),
      { threshold: 0.09 }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar({ solid }) {
  const [open, setOpen] = useState(false);
  const links = ['Portfolio', 'Servizi', 'Recensioni', 'Video', 'Contatti'];

  // Blocca lo scroll del body quando il menu mobile è aperto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <nav className={`nav${solid ? ' solid' : ''}${open ? ' open' : ''}`}>
      <Link className="nav-logo" href="/" onClick={() => setOpen(false)}>Alessandro Naldoni</Link>
      <ul className="nav-links">
        {links.map(l => (
          <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
        ))}
      </ul>
      <button
        className="nav-burger"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span /><span /><span />
      </button>
      <div className={`nav-mobile${open ? ' show' : ''}`}>
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}>{l}</a>
        ))}
      </div>
    </nav>
  );
}

/* ─── Hero slideshow ──────────────────────────────────────────────────────── */
function Hero() {
  const [cur, setCur] = useState(0);
  const slides = HERO_IMAGES.length ? HERO_IMAGES : PROJECTS.slice(0, 5).map(p => p.cover);

  // Auto advance
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setCur(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="hero" id="hero">
      <div className="hero-slides">
        {slides.map((src, i) => (
          <div key={src} className={`hero-slide${i === cur ? ' active' : ''}`}>
            <img
              src={src}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
      <div className="hero-veil" />

      <div className="hero-content">
        <div className="hero-eyebrow">Cotignola, Ravenna — Est. 2022</div>
        <h1 className="hero-name">Alessandro<br />Naldoni</h1>
        <p className="hero-sub">Photographer &amp; Filmmaker</p>
      </div>

      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === cur ? ' active' : ''}`}
            onClick={() => setCur(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <a className="hero-arrow" href="#intro" aria-label="Scorri">
        <div className="hero-arrow-line" />
        <span>Scorri</span>
      </a>
    </section>
  );
}

/* ─── Intro ───────────────────────────────────────────────────────────────── */
function Intro() {
  return (
    <section className="intro section-pad" id="intro">
      <div className="inner intro-grid">
        <div className="intro-left reveal">
          <div className="intro-photo">
            <img
              src={ABOUT_IMAGE}
              alt="Alessandro Naldoni"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="intro-photo-fallback">Foto in arrivo</span>
          </div>
          <div className="intro-number"><CountUp value="03" /></div>
          <div className="intro-number-label">Anni di Esperienza</div>
        </div>
        <div>
          <div className="s-label reveal">Chi sono</div>
          <p className="intro-text reveal d1">
            Fotografo specializzato in moda con esperienze dirette alla Fashion Week
            e al Festival di Sanremo. Lavoro con agenzie, talent e brand. Il mio punto
            di forza è ascoltare le persone per restituire immagini che le rappresentano davvero.
          </p>
          <div className="intro-facts reveal d2">
            {[
              { n: 'FW', l: 'Fashion Week' },
              { n: '50+', l: 'Clienti' },
              { n: '3', l: 'Anni Attivi' },
            ].map(f => (
              <div key={f.l}>
                <div className="intro-fact-n"><CountUp value={f.n} /></div>
                <div className="intro-fact-l">{f.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Portfolio ───────────────────────────────────────────────────────────── */
function Portfolio() {
  return (
    <section className="portfolio section-pad" id="portfolio">
      <div className="inner portfolio-head">
        <div className="reveal">
          <div className="s-label">Lavori</div>
          <h2 className="s-title">Il <em>Portfolio</em></h2>
        </div>
        <Link className="portfolio-view-all reveal d1" href="/#portfolio">
          Tutti i Progetti →
        </Link>
      </div>

      <div className="inner">
        <div className="p-grid">
          {PROJECTS.map((p, i) => (
            <Link
              key={p.id}
              className="p-cell reveal"
              href={`/progetti/${p.slug}`}
              style={{ transitionDelay: `${(i % 3) * 0.09}s` }}
            >
              <img
                src={p.cover}
                alt={p.title}
                loading={i < 3 ? 'eager' : 'lazy'}
              />
              <div className="p-overlay">
                <div className="p-cat">{p.category}</div>
                <div className="p-name">{p.title}</div>
                <span className="p-link">Vedi Progetto →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Services ────────────────────────────────────────────────────────────── */
function Services() {
  return (
    <section className="services section-pad" id="servizi">
      <div className="inner">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="s-label" style={{ justifyContent: 'center' }}>Cosa faccio</div>
          <h2 className="s-title">Servizi</h2>
        </div>
        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <div key={s.title} className={`svc-item reveal d${(i % 3) + 1}`}>
              <span className="svc-icon">{s.icon}</span>
              <div className="svc-name">{s.title}</div>
              <p className="svc-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Clients marquee ─────────────────────────────────────────────────────── */
function Clients() {
  const doubled = [...CLIENTS, ...CLIENTS];
  return (
    <section className="clients section-pad-sm" id="clienti">
      <div className="clients-track">
        {doubled.map((c, i) => (
          <div key={i} className="clients-item">
            <span>{c}</span>
            <span className="clients-sep">—</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Reviews ─────────────────────────────────────────────────────────────── */
function Reviews() {
  return (
    <section className="reviews section-pad" id="recensioni">
      <div className="inner">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="s-label" style={{ justifyContent: 'center' }}>Recensioni</div>
          <h2 className="s-title">Cosa dicono <em>di me</em></h2>
        </div>
        <div className="reviews-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`review-item reveal d${i + 1}`}>
              <div className="review-open">"</div>
              <p className="review-text">{t.quote}</p>
              <div className="review-divider" />
              <div className="review-author">{t.author}</div>
              <div className="review-role">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Video ───────────────────────────────────────────────────────────────── */
function VideoSec() {
  const [url, setUrl] = useState('');
  const [vid, setVid] = useState('');

  const load = () => {
    try {
      const u = new URL(url.trim());
      const id = u.hostname.includes('youtu.be')
        ? u.pathname.slice(1)
        : u.searchParams.get('v');
      if (id) { setVid(id); return; }
    } catch {}
    alert('URL YouTube non valido.');
  };

  return (
    <section className="video-sec section-pad" id="video">
      <div className="inner video-inner">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="s-label" style={{ justifyContent: 'center' }}>Showreel</div>
          <h2 className="s-title">Video <em>&amp; Reel</em></h2>
        </div>
        <div className="video-row reveal d1">
          <input
            className="v-input"
            type="text"
            placeholder="Incolla un URL YouTube..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
          <button className="v-btn" onClick={load}>Carica</button>
        </div>
        <div className="v-frame reveal d2">
          {vid ? (
            <iframe
              src={`https://www.youtube.com/embed/${vid}?rel=0`}
              title="Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="v-empty">
              <div className="v-empty-icon">▷</div>
              <div className="v-empty-txt">Incolla un URL YouTube per visualizzare il video</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ─────────────────────────────────────────────────────────────── */
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/studio@alessandronaldoniphoto.it';

function Contact() {
  const [f, setF]         = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | ok | error
  const change = e => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: f.name,
          email: f.email,
          message: f.message,
          _subject: `Nuovo contatto dal sito — ${f.name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      if (res.ok) {
        setStatus('ok');
        setF({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 6000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };
  const ok = status === 'ok';

  return (
    <section className="contact-sec section-pad" id="contatti">
      <div className="inner">
        <div className="reveal">
          <div className="s-label" style={{ justifyContent: 'center' }}>Contatti</div>
          <h2 className="s-title">Lavoriamo <em>Insieme</em></h2>
        </div>

        <a
          className="contact-email-big reveal d1"
          href="mailto:studio@alessandronaldoniphoto.it"
        >
          studio@alessandronaldoniphoto.it
        </a>

        <div className="contact-links reveal d2">
          <a className="contact-link" href="https://instagram.com/alessandronaldoniphoto" target="_blank" rel="noopener noreferrer">
            Instagram →
          </a>
          <a className="contact-link" href="https://alessandronaldoniphoto.it" target="_blank" rel="noopener noreferrer">
            Sito Web →
          </a>
          <span className="contact-link" style={{ color: 'var(--grey-light)', pointerEvents: 'none' }}>
            Cotignola, Ravenna
          </span>
        </div>

        <form className="contact-form reveal d3" onSubmit={submit}>
          <div className="cf-row">
            <div>
              <label className="cf-label">Nome</label>
              <input className="cf-input" name="name" value={f.name} onChange={change} required placeholder="Il tuo nome" />
            </div>
            <div>
              <label className="cf-label">Email</label>
              <input className="cf-input" type="email" name="email" value={f.email} onChange={change} required placeholder="La tua email" />
            </div>
          </div>
          <div>
            <label className="cf-label">Messaggio</label>
            <textarea className="cf-area" name="message" value={f.message} onChange={change} required placeholder="Raccontami il tuo progetto..." />
          </div>
          <button type="submit" className="cf-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Invio…'
              : status === 'ok' ? '✓ Inviato'
              : status === 'error' ? 'Errore — riprova'
              : 'Invia Messaggio'}
          </button>
        </form>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-name">Alessandro <span>Naldoni</span></div>
      <div className="footer-copy">© {new Date().getFullYear()}</div>
      <div className="footer-links">
        <a href="https://instagram.com/alessandronaldoniphoto" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="mailto:studio@alessandronaldoniphoto.it">Email</a>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useReveal();

  return (
    <>
      <Head>
        <title>Alessandro Naldoni — Photographer &amp; Filmmaker</title>
        <meta name="description" content="Fotografo professionista specializzato in moda, ritratto ed eventi. Cotignola, Ravenna." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrap">
        <Navbar solid={solid} />
        <main>
          <Hero />
          <Intro />
          <Portfolio />
          <Services />
          <Clients />
          <Reviews />
          <VideoSec />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
