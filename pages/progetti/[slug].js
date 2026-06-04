import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PROJECTS } from '../../data/projects';

/* ─── Reveal ─────────────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }),
      { threshold: 0.06 }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Lightbox (ingrandimento a schermo intero) ──────────────────────────── */
function Lightbox({ images, index, title, onClose, onPrev, onNext }) {
  const touchX = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // reset lo stato di caricamento quando cambia immagine
  useEffect(() => { setLoaded(false); }, [index]);

  // precarica l'immagine precedente e successiva
  useEffect(() => {
    const total = images.length;
    [(index + 1) % total, (index - 1 + total) % total].forEach(i => {
      const img = new Image();
      img.src = images[i];
    });
  }, [index, images]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  const onTouchStart = e => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 50) onPrev();
    else if (dx < -50) onNext();
    touchX.current = null;
  };

  return (
    <div className="lb" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lb-close" onClick={onClose} aria-label="Chiudi">×</button>
      <button
        className="lb-nav lb-prev"
        onClick={e => { e.stopPropagation(); onPrev(); }}
        aria-label="Precedente"
      >‹</button>

      <div
        className="lb-stage"
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {!loaded && <span className="lb-spinner" aria-hidden="true" />}
        <img
          key={index}
          src={images[index]}
          alt={`${title} — ${index + 1}`}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      </div>

      <button
        className="lb-nav lb-next"
        onClick={e => { e.stopPropagation(); onNext(); }}
        aria-label="Successivo"
      >›</button>

      <div className="lb-counter">
        {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>
    </div>
  );
}

/* ─── Static generation ─────────────────────────────────────────────────── */
export function getStaticPaths() {
  return {
    paths: PROJECTS.map(p => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const idx  = PROJECTS.findIndex(p => p.slug === params.slug);
  const prev = idx > 0                   ? PROJECTS[idx - 1] : null;
  const next = idx < PROJECTS.length - 1 ? PROJECTS[idx + 1] : null;
  return { props: { project: PROJECTS[idx], prev, next } };
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ProgettoPage({ project, prev, next }) {
  useReveal();
  const [lb, setLb] = useState(null);
  const total = project.images.length;

  const open  = i => setLb(i);
  const close = useCallback(() => setLb(null), []);
  const goPrev = useCallback(() => setLb(i => (i - 1 + total) % total), [total]);
  const goNext = useCallback(() => setLb(i => (i + 1) % total), [total]);

  return (
    <>
      <Head>
        <title>{project.title} — Alessandro Naldoni</title>
        <meta name="description" content={`${project.title} — ${project.category}. Portfolio di Alessandro Naldoni.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrap">
        {/* ─ Navbar ─ */}
        <nav className="proj-nav">
          <Link className="proj-back" href="/#portfolio">
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <path d="M6 1L1 5M1 5L6 9M1 5H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Portfolio</span>
          </Link>
          <Link href="/" style={{ fontFamily: 'var(--f-title)', fontSize: 17, fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--black)' }}>
            Alessandro Naldoni
          </Link>
          <Link href="/#contatti" style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--grey)', borderBottom: '1px solid var(--border)', paddingBottom: 2 }}>
            Contattami
          </Link>
        </nav>

        {/* ─ Header ─ */}
        <div className="proj-header">
          <div className="proj-meta reveal">
            <span className="proj-cat">{project.category}</span>
          </div>
          <h1 className="proj-title reveal d1">{project.title}</h1>
          <p className="proj-desc reveal d2">
            {total} scatti — clicca un'immagine per ingrandirla.
          </p>
        </div>

        {/* ─ Gallery ─ */}
        <div className="proj-gallery">
          {project.images.map((src, i) => {
            const feature = i === 0 || i % 6 === 5;
            return (
              <button
                key={i}
                type="button"
                className={`gimg reveal${feature ? ' g-feature' : ''}`}
                style={{ transitionDelay: `${(i % 2) * 0.07}s` }}
                onClick={() => open(i)}
                aria-label={`Ingrandisci immagine ${i + 1}`}
              >
                <span className="gimg-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="gimg-zoom" aria-hidden="true">⤢</span>
                <img
                  src={src}
                  alt={`${project.title} — ${i + 1}`}
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              </button>
            );
          })}
        </div>

        {/* ─ Prev / Next ─ */}
        <div className="proj-pn">
          {prev ? (
            <Link className="pn-link" href={`/progetti/${prev.slug}`}>
              <div className="pn-lbl">← Precedente</div>
              <div className="pn-name">{prev.title}</div>
            </Link>
          ) : <div />}

          <Link className="pn-center" href="/#portfolio" title="Tutti i Progetti">⊞</Link>

          {next ? (
            <Link className="pn-link" href={`/progetti/${next.slug}`} style={{ textAlign: 'right' }}>
              <div className="pn-lbl">Successivo →</div>
              <div className="pn-name">{next.title}</div>
            </Link>
          ) : <div />}
        </div>

        {/* ─ Footer ─ */}
        <footer className="footer">
          <div className="footer-name">Alessandro <span>Naldoni</span></div>
          <div className="footer-copy">© {new Date().getFullYear()}</div>
          <div className="footer-links">
            <a href="https://instagram.com/alessandronaldoniphoto" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="mailto:studio@alessandronaldoniphoto.it">Email</a>
          </div>
        </footer>
      </div>

      {lb !== null && (
        <Lightbox
          images={project.images}
          index={lb}
          title={project.title}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  );
}
