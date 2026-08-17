/**
 * Server-rendered Open Graph page for a shared post — /p/:id
 *
 * Why this exists: WhatsApp, Facebook, Telegram, iMessage and Slack fetch a
 * shared link with a crawler that does NOT execute JavaScript. The app is a
 * client-rendered Vite SPA, so those crawlers would only ever see an empty
 * <div id="root"> and show a bare grey link with no photo.
 *
 * So this function fetches the post from the public (unauthenticated) preview
 * endpoint and returns real HTML with og: tags. Crawlers read the tags and
 * render the card; real browsers run the inline script and land in the app at
 * /?post=<id>, which opens the post detail modal.
 *
 * Wired up by the /p/:id rewrite in vercel.json.
 */

const API_BASE =
  process.env.API_BASE_URL ||
  'https://kick-analyst-backend-production.jay886631.workers.dev';

// A branded 1200x630 PNG dropped here is used when a post has no photo of its
// own. Left unset the card simply renders without an image — SVG favicons are
// not supported by any of the crawlers, so /favicon.svg is not a usable value.
const DEFAULT_OG_IMAGE = process.env.DEFAULT_OG_IMAGE || '';

const SITE_NAME = 'Kink Catalyst';

/** Escapes text before it goes into an HTML attribute — captions are user input. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only allow http(s) URLs through to og:image, never javascript: or data:. */
function safeImage(url) {
  if (typeof url !== 'string') return '';
  return /^https:\/\//i.test(url) ? url : '';
}

function truncate(str, max) {
  const s = String(str ?? '').replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function page({ title, description, image, canonical, redirectTo }) {
  const imageTags = image
    ? `<meta property="og:image" content="${esc(image)}" />
    <meta property="og:image:alt" content="${esc(title)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    <meta name="twitter:card" content="summary_large_image" />`
    : `<meta name="twitter:card" content="summary" />`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href="${esc(canonical)}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    ${imageTags}

    <meta name="description" content="${esc(description)}" />
  </head>
  <body style="margin:0;background:#0b101a;color:#93a0bd;font-family:system-ui,sans-serif">
    <noscript><p style="padding:24px">Open this post in <a href="${esc(redirectTo)}" style="color:#5b8cff">${esc(SITE_NAME)}</a>.</p></noscript>
    <script>window.location.replace(${JSON.stringify(redirectTo)});</script>
  </body>
</html>`;
}

export default async function handler(req, res) {
  const rawId = req.query?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host  = req.headers['x-forwarded-host'] || req.headers.host || '';
  const origin = `${proto}://${host}`;

  // Anything unresolvable still returns a valid page rather than an error, so a
  // stale or deleted link degrades to the app instead of a Vercel error screen.
  const fallback = () =>
    res
      .status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .setHeader('Cache-Control', 'public, max-age=60')
      .send(page({
        title: SITE_NAME,
        description: 'This post is unavailable or private.',
        image: DEFAULT_OG_IMAGE,
        canonical: `${origin}/`,
        redirectTo: `${origin}/`,
      }));

  if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return fallback();

  let post;
  try {
    const upstream = await fetch(`${API_BASE}/api/public/posts/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!upstream.ok) return fallback();          // 404 covers private + deleted
    const body = await upstream.json();
    post = body?.data ?? body;
  } catch {
    return fallback();                            // upstream down — never 500 a crawler
  }

  if (!post) return fallback();

  const author  = truncate(post.authorName, 60) || 'Someone';
  const caption = truncate(post.caption, 180);

  res
    .status(200)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    // Short cache: crawlers re-fetch, and a post's caption can still be edited.
    .setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
    .send(page({
      title: `${author} on ${SITE_NAME}`,
      description: caption || `See this post by ${author} on ${SITE_NAME}.`,
      image: safeImage(post.image) || safeImage(post.authorAvatar) || DEFAULT_OG_IMAGE,
      canonical: `${origin}/p/${id}`,
      redirectTo: `${origin}/?post=${encodeURIComponent(id)}`,
    }));
}
