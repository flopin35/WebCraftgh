import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FONT_PAIRINGS, PAGE_OPTIONS, VISUAL_STYLES } from '../../data/builder/builderOptions';
import { contrastRatio, normalizeHex, readableTextOn } from '../../utils/colorContrast';
import { useGoogleFonts } from './useGoogleFont';

const DEVICES = [
  { id: 'desktop', label: 'Desktop', width: 1200 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

const SAMPLE = {
  headline: 'Your headline goes here',
  description: 'A short description of what you do and why customers choose you. Replace this with your own words.',
  offerings: ['Service one', 'Service two', 'Service three'],
};

function useObjectUrl(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return undefined;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

export default function LivePreview({ state, features, logoFile }) {
  const [device, setDevice] = useState('desktop');
  const [darkToggle, setDarkToggle] = useState(false);
  const frameRef = useRef(null);
  const [scale, setScale] = useState(1);
  const siteRef = useRef(null);
  const [siteHeight, setSiteHeight] = useState(800);
  const logoUrl = useObjectUrl(logoFile);

  const font = FONT_PAIRINGS.find((item) => item.id === state.style.fontId) ?? FONT_PAIRINGS[0];
  const fontList = useMemo(() => [font], [font]);
  useGoogleFonts(fontList);
  const style = VISUAL_STYLES.find((item) => item.id === state.style.styleId) ?? VISUAL_STYLES[0];
  const width = DEVICES.find((d) => d.id === device).width;

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const measure = () => setScale(Math.min(1, el.clientWidth / width));
    measure();
    const observer = new ResizeObserver(() => {
      measure();
      if (siteRef.current) setSiteHeight(siteRef.current.offsetHeight);
    });
    observer.observe(el);
    if (siteRef.current) observer.observe(siteRef.current);
    return () => observer.disconnect();
  }, [width]);

  const dark = state.style.colorMode === 'dark' || (state.style.colorMode === 'both' && darkToggle);
  const primary = normalizeHex(state.branding.primary) ?? '#2563eb';
  const accent = normalizeHex(state.branding.accent) ?? '#f59e0b';
  let background = normalizeHex(state.branding.secondary) ?? '#ffffff';
  if (dark) background = '#0f172a';
  const text = readableTextOn(background);
  const muted = text === '#ffffff' ? 'rgba(255,255,255,0.72)' : 'rgba(17,24,39,0.68)';
  const surface = text === '#ffffff' ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.04)';
  const heroBg = style.id === 'minimal' || style.id === 'editorial' ? background : primary;
  const heroText = readableTextOn(heroBg);
  // If primary is unreadable on the background, use the text colour for headings/links instead.
  const linkColor = contrastRatio(primary, background) >= 3 ? primary : text;

  const vars = {
    '--pv-primary': primary,
    '--pv-on-primary': readableTextOn(primary),
    '--pv-accent': accent,
    '--pv-on-accent': readableTextOn(accent),
    '--pv-bg': background,
    '--pv-text': text,
    '--pv-muted': muted,
    '--pv-surface': surface,
    '--pv-link': linkColor,
    '--pv-hero-bg': heroBg,
    '--pv-hero-text': heroText,
    '--pv-radius': `${style.radius}px`,
    '--pv-weight': style.weight,
    '--pv-spacing': style.spacing,
    '--pv-heading': `'${font.heading}', ${font.category === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif'}`,
    '--pv-body': `'${font.body}', system-ui, sans-serif`,
    width,
    transform: `scale(${scale})`,
  };

  const has = (id) => features.includes(id) || state.pages.includes(id);
  const t = state.text;
  const name = t.projectName.trim() || 'Your Business';
  const offerings = t.offerings
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);
  const cards = offerings.length ? offerings : SAMPLE.offerings;
  const navPages = state.pages.filter((id) => !['home', 'service-details', 'product-details', 'legal', 'admin-dashboard', 'customer-dashboard'].includes(id)).slice(0, device === 'desktop' ? 6 : 0);
  const isStore = state.type === 'ecommerce' || has('products') || has('shopping-cart');
  const isMobile = device === 'mobile';

  return (
    <div className="pv">
      <div className="pv__toolbar">
        <div className="pv__devices" role="radiogroup" aria-label="Preview size">
          {DEVICES.map((d) => (
            <button key={d.id} type="button" role="radio" aria-checked={device === d.id} className={device === d.id ? 'is-selected' : ''} onClick={() => setDevice(d.id)}>
              {d.label}
            </button>
          ))}
        </div>
        {state.style.colorMode === 'both' && (
          <button type="button" className="pv__mode" onClick={() => setDarkToggle((v) => !v)} aria-pressed={darkToggle}>
            {darkToggle ? '☀ Light' : '☾ Dark'}
          </button>
        )}
      </div>
      <p className="pv__badge">Design preview · sample layout, not your finished website</p>

      <div className="pv__frame" ref={frameRef}>
        <div className="pv__chrome">
          <span />
          <span />
          <span />
          <em>{state.domain.domainName || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'yourbusiness'}.com`}</em>
        </div>
        <div className="pv__viewport" style={{ height: Math.ceil(siteHeight * scale) }}>
          <div ref={siteRef} className={`pv-site pv-site--${style.id}${isMobile ? ' pv-site--mobile' : ''}`} style={vars} aria-hidden="true">
            <header className="pv-site__nav">
              <div className="pv-site__brand">
                {logoUrl ? <img src={logoUrl} alt="" /> : <span className="pv-site__logo">{name.charAt(0)}</span>}
                <strong>{name}</strong>
              </div>
              {navPages.length > 0 ? (
                <nav>
                  {navPages.map((id) => (
                    <span key={id}>{PAGE_OPTIONS.find((p) => p.id === id)?.label.split(' ')[0]}</span>
                  ))}
                  {isStore && <span className="pv-site__cart">🛒 0</span>}
                </nav>
              ) : (
                <span className="pv-site__burger">☰</span>
              )}
            </header>

            <section className="pv-site__hero">
              <div>
                {has('animations') && <span className="pv-site__eyebrow">✦ Welcome</span>}
                <h1>{t.headline.trim() || SAMPLE.headline}</h1>
                <p>{t.description.trim() || SAMPLE.description}</p>
                <div className="pv-site__ctas">
                  <span className="pv-btn pv-btn--accent">{t.ctaPrimary || 'Get started'}</span>
                  {t.ctaSecondary && <span className="pv-btn pv-btn--ghost">{t.ctaSecondary}</span>}
                </div>
              </div>
              {!isMobile && <div className="pv-site__hero-img">{has('image-slider') ? '◀  Slider  ▶' : 'Image'}</div>}
            </section>

            <section className="pv-site__section">
              <h2>{isStore ? 'Featured products' : 'What we offer'}</h2>
              <div className="pv-site__cards">
                {cards.slice(0, isMobile ? 2 : 3).map((card) => (
                  <div key={card} className="pv-site__card">
                    <div className="pv-site__thumb" />
                    <strong>{card.split(/[-–:]/)[0].trim().slice(0, 40)}</strong>
                    <span>{isStore ? 'GH₵ —' : 'Short description'}</span>
                    {isStore && <span className="pv-btn pv-btn--primary pv-btn--sm">Add to cart</span>}
                  </div>
                ))}
              </div>
            </section>

            {has('photo-gallery') && (
              <section className="pv-site__section">
                <h2>Gallery</h2>
                <div className="pv-site__gallery">
                  {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
                    <div key={i} />
                  ))}
                </div>
              </section>
            )}

            {(has('booking-system') || has('booking')) && (
              <section className="pv-site__section pv-site__band">
                <h2>Book an appointment</h2>
                <div className="pv-site__form">
                  <span>Select service ▾</span>
                  <span>📅 Pick a date</span>
                  <span className="pv-btn pv-btn--primary">Book now</span>
                </div>
              </section>
            )}

            {(has('testimonials') || has('reviews')) && (
              <section className="pv-site__section">
                <h2>What customers say</h2>
                <div className="pv-site__cards">
                  {['“Excellent service.”', '“Highly recommended.”'].map((q) => (
                    <blockquote key={q} className="pv-site__card">
                      {q}
                      <span>{has('reviews') ? '★★★★★' : '— Happy client'}</span>
                    </blockquote>
                  ))}
                </div>
              </section>
            )}

            {has('blog-cms') && (
              <section className="pv-site__section">
                <h2>Latest news</h2>
                <div className="pv-site__list">
                  <span>Article title one · 3 min read</span>
                  <span>Article title two · 5 min read</span>
                </div>
              </section>
            )}

            {(has('contact-form') || has('google-maps') || has('newsletter')) && (
              <section className="pv-site__section pv-site__contact">
                {has('contact-form') && (
                  <div className="pv-site__form">
                    <h2>Get in touch</h2>
                    <span>Name</span>
                    <span>Message</span>
                    <span className="pv-btn pv-btn--primary">Send</span>
                  </div>
                )}
                {has('google-maps') && <div className="pv-site__map">📍 Map</div>}
                {has('newsletter') && (
                  <div className="pv-site__news">
                    <strong>Join our newsletter</strong>
                    <span>email@example.com</span>
                  </div>
                )}
              </section>
            )}

            <footer className="pv-site__footer">
              <span>© {name}</span>
              <span>
                {has('social-links') && 'f  in  𝕏'} {has('click-to-call') && ' · 📞 Call'} {has('email-links') && ' · ✉ Email'}
              </span>
            </footer>
            {has('whatsapp') && <span className="pv-site__wa">💬</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
