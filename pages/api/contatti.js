import { Resend } from 'resend';

/* ─── Config ──────────────────────────────────────────────────────────────── */
// Destinatario. Di default lo studio; sovrascrivibile con CONTACT_TO in .env.local
// (utile in modalità test Resend, dove si può consegnare solo alla mail dell'account).
const TO_EMAIL   = process.env.CONTACT_TO || 'studio@alessandronaldoniphoto.it';
// Mittente: deve appartenere a un dominio verificato su Resend.
// Sovrascrivibile con FROM_EMAIL in .env.local (es. "Sito <no-reply@alessandronaldoniphoto.it>").
const FROM_EMAIL = process.env.FROM_EMAIL || 'Sito Alessandro Naldoni <no-reply@alessandronaldoniphoto.it>';

const LIMITS = { name: 100, email: 200, message: 5000 };

// Rate limiting in memoria: max 3 invii ogni 10 minuti per IP.
const RATE_MAX      = 3;
const RATE_WINDOW   = 10 * 60 * 1000; // 10 minuti
const hits = new Map(); // ip -> [timestamp, ...]

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

// Pulizia periodica per non far crescere la Map all'infinito.
function sweep() {
  const now = Date.now();
  for (const [ip, arr] of hits) {
    const recent = arr.filter(t => now - t < RATE_WINDOW);
    if (recent.length) hits.set(ip, recent);
    else hits.delete(ip);
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clientIp = req =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket?.remoteAddress ||
  'unknown';

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export const config = { api: { bodyParser: { sizeLimit: '64kb' } } };

/* ─── Handler ─────────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name    = typeof body.name    === 'string' ? body.name.trim()    : '';
  const email   = typeof body.email   === 'string' ? body.email.trim()   : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const honeypot = typeof body.website === 'string' ? body.website.trim() : '';

  // Honeypot: se compilato è un bot → scarta silenziosamente (finge successo).
  if (honeypot) return res.status(200).json({ ok: true });

  // Validazione server-side.
  if (!name || !email || !message) return res.status(400).json({ ok: false });
  if (!EMAIL_RE.test(email))        return res.status(400).json({ ok: false });
  if (name.length    > LIMITS.name)    return res.status(400).json({ ok: false });
  if (email.length   > LIMITS.email)   return res.status(400).json({ ok: false });
  if (message.length > LIMITS.message) return res.status(400).json({ ok: false });

  // Rate limiting.
  sweep();
  if (rateLimited(clientIp(req))) return res.status(429).json({ ok: false });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contatti] RESEND_API_KEY mancante');
    return res.status(500).json({ ok: false });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Nuova richiesta dal sito — ${name}`,
      text:
        `Nome: ${name}\n` +
        `Email: ${email}\n\n` +
        `${message}\n`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">` +
        `<p><strong>Nome:</strong> ${esc(name)}</p>` +
        `<p><strong>Email:</strong> ${esc(email)}</p>` +
        `<p><strong>Messaggio:</strong></p>` +
        `<p style="white-space:pre-wrap">${esc(message)}</p>` +
        `</div>`,
    });

    if (error) {
      console.error('[contatti] invio fallito:', error);
      return res.status(502).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[contatti] errore inatteso:', err);
    return res.status(500).json({ ok: false });
  }
}
