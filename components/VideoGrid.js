// Griglia video: verticali in fila, orizzontali sotto a tutta larghezza
function Card({ v, i }) {
  const onPlay = e => {
    document.querySelectorAll('.v-card video').forEach(x => { if (x !== e.target) x.pause(); });
  };
  return (
    <figure className={`v-card${v.h ? ' v-h' : ''} reveal d${(i % 2) + 1}`}>
      <video
        src={v.src}
        poster={v.poster}
        preload="none"
        controls
        playsInline
        onPlay={onPlay}
        width={v.h ? 1280 : 720}
        height={v.h ? 720 : 1280}
      />
      <figcaption>
        <div className="p-cat">{v.tag}</div>
        <div className="v-name">{v.title}</div>
      </figcaption>
    </figure>
  );
}

export default function VideoGrid({ videos }) {
  const vert = videos.filter(v => !v.h);
  const oriz = videos.filter(v => v.h);
  return (
    <>
      <div className="v-grid">
        {vert.map((v, i) => <Card key={v.id} v={v} i={i} />)}
      </div>
      {oriz.length > 0 && (
        <div className="v-grid-h">
          {oriz.map((v, i) => <Card key={v.id} v={v} i={i} />)}
        </div>
      )}
    </>
  );
}
