import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PROJECTS, VIDEOS } from '../data/projects';
import { img, srcSet, dims } from '../data/img';

// Pagina privata per Banana Studios: non indicizzata e non linkata dal menu
const SELEZIONE = ['brand', 'milano-fashion-week', 'editoriale-clara', 'francesca', 'cristina-studio', 'zanzibar'];

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

export default function BananaStudios() {
  useReveal();
  const progetti = SELEZIONE.map(s => PROJECTS.find(p => p.slug === s)).filter(Boolean);
  const onPlay = e => {
    document.querySelectorAll('.v-card video').forEach(v => { if (v !== e.target) v.pause(); });
  };

  return (
    <>
      <Head>
        <title>Selezione lavori — Alessandro Naldoni</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrap">
        <nav className="nav solid">
          <Link className="nav-logo" href="/">Alessandro Naldoni</Link>
        </nav>

        <main>
          <section className="section-pad sel-head">
            <div className="inner reveal" style={{ textAlign: 'center' }}>
              <div className="s-label" style={{ justifyContent: 'center' }}>Per Banana Studios</div>
              <h2 className="s-title">Selezione <em>lavori</em></h2>
              <p className="sel-intro">Video brand e fotografia fashion / prodotto. Una raccolta pensata per voi.</p>
            </div>
          </section>

          <section className="video-sec section-pad" style={{ paddingTop: 0 }}>
            <div className="inner">
              <div className="reveal" style={{ textAlign: 'center' }}>
                <div className="s-label" style={{ justifyContent: 'center' }}>Video</div>
                <h2 className="s-title">Brand <em>content</em></h2>
              </div>
              <div className="v-grid">
                {VIDEOS.map((v, i) => (
                  <figure key={v.id} className={`v-card reveal d${(i % 2) + 1}`}>
                    <video src={v.src} poster={v.poster} preload="none" controls playsInline onPlay={onPlay} width={720} height={1280} />
                    <figcaption>
                      <div className="p-cat">{v.tag}</div>
                      <div className="v-name">{v.title}</div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          <section className="portfolio section-pad">
            <div className="inner">
              <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
                <div className="s-label" style={{ justifyContent: 'center' }}>Foto</div>
                <h2 className="s-title">Fashion <em>&amp; Brand</em></h2>
              </div>
              <div className="p-grid">
                {progetti.map((p, i) => (
                  <Link key={p.id} className="p-cell reveal" href={`/progetti/${p.slug}`} style={{ transitionDelay: `${(i % 3) * 0.09}s` }}>
                    <img src={img(p.cover, 800)} srcSet={srcSet(p.cover)} sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw" {...dims(p.cover)} alt={p.title} loading="lazy" decoding="async" />
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

          <section className="section-pad sel-contact">
            <div className="inner reveal" style={{ textAlign: 'center' }}>
              <div className="s-label" style={{ justifyContent: 'center' }}>Contatti</div>
              <h2 className="s-title">Lavoriamo <em>insieme</em></h2>
              <p className="sel-intro">
                <a href="mailto:studio@alessandronaldoniphoto.it">studio@alessandronaldoniphoto.it</a><br />
                <a href="tel:+393486546065">+39 348 654 6065</a>
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
