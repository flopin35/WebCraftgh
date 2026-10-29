import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { FEATURE_OPTIONS, PAGE_OPTIONS, PAYMENT_METHODS, VISUAL_STYLES, WEBSITE_TYPES, labelOf } from '../../data/builder/builderOptions';
import { DEFAULT_PRICE_LIST } from '../../data/builder/defaultPriceList';
import { auth } from '../../firebase';
import { loadPriceList, savePriceList } from '../../services/priceListService';
import { calculateEstimate, formatCedis } from '../../utils/builderPricing';
import { createInitialBuilderState } from '../../data/builder/initialState';
import '../../components/admin/builder/builderAdmin.css';
import './Admin.css';

const humanize = (key) => key.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

const SECTIONS = [
  { path: ['baseByType'], title: 'Base price by website type', labels: WEBSITE_TYPES },
  { path: ['pages'], title: 'Pages', labels: PAGE_OPTIONS },
  { path: ['extraPage'], title: 'Extra custom pages' },
  { path: ['features'], title: 'Features', labels: FEATURE_OPTIONS },
  { path: ['design', 'styleSurcharge'], title: 'Visual style surcharges', labels: VISUAL_STYLES },
  { path: ['design', 'colorMode'], title: 'Light / dark mode' },
  { path: ['design'], title: 'Design services', skipObjects: true },
  { path: ['content'], title: 'Content services' },
  { path: ['ecommerce', 'productCount'], title: 'Catalogue size' },
  { path: ['ecommerce', 'paymentMethod'], title: 'Payment method setup', labels: PAYMENT_METHODS },
  { path: ['ecommerce'], title: 'Store options', skipObjects: true },
  { path: ['setup'], title: 'One-time setup' },
  { path: ['recurring', 'hostingPerYear'], title: 'Hosting per year (shown separately)' },
  { path: ['recurring', 'maintenancePerMonth'], title: 'Maintenance per month (shown separately)' },
  { path: ['recurring'], title: 'Domain per year (shown separately)', skipObjects: true },
  { path: [], title: 'Estimate rounding & range', only: ['rounding', 'rangePercent'] },
];

const getAt = (obj, path) => path.reduce((o, k) => o?.[k], obj);
function setAt(obj, path, key, value) {
  const clone = structuredClone(obj);
  const target = path.reduce((o, k) => o[k], clone);
  target[key] = value;
  return clone;
}

export default function PriceListEditor() {
  const [list, setList] = useState(null);
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [json, setJson] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadPriceList({ force: true }).then(({ priceList, source: src }) => {
      setList(priceList);
      setSource(src);
      setJson(JSON.stringify(priceList, null, 2));
    });
  }, []);

  const sample = useMemo(() => {
    if (!list) return null;
    const state = {
      ...createInitialBuilderState(),
      type: 'business',
      pages: ['home', 'about', 'services', 'contact', 'gallery'],
      features: ['contact-form', 'whatsapp', 'google-maps', 'photo-gallery', 'seo-basics'],
      domain: { ownsDomain: 'no', wantsDomainHelp: true, hosting: 'webcraft', maintenance: 'none' },
    };
    return calculateEstimate(state, list);
  }, [list]);

  if (!list) {
    return (
      <>
        <Navbar />
        <main className="admin-page">
          <div className="container">Loading price list…</div>
        </main>
      </>
    );
  }

  const change = (path, key, raw) => {
    const value = raw === '' ? 0 : Number(raw);
    if (!Number.isFinite(value) || value < 0) return;
    const next = setAt(list, path, key, value);
    setList(next);
    setJson(JSON.stringify(next, null, 2));
  };

  const save = async () => {
    setBusy(true);
    setMessage('');
    const result = await savePriceList(list, { adminEmail: auth?.currentUser?.email, note });
    setBusy(false);
    if (result.success) {
      setList(result.priceList);
      setJson(JSON.stringify(result.priceList, null, 2));
      setSource('live');
      setNote('');
    }
    setMessage(result.success ? `Saved as version ${result.priceList.version}. New estimates use these prices immediately.` : result.error);
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object' || !parsed.baseByType || !parsed.features) throw new Error('Missing baseByType or features.');
      setList(parsed);
      setMessage('JSON applied — review, then click Save.');
    } catch (error) {
      setMessage(`Invalid JSON: ${error.message}`);
    }
  };

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <div className="container admin-page__inner">
          <header className="admin-page__header">
            <div>
              <p className="admin-page__label">Admin · Pricing</p>
              <h1>Builder price list</h1>
              <p className="admin-page__subtitle">
                Version {list.version} · {source === 'live' ? 'live (Firestore)' : 'using built-in defaults — save once to make it editable live'}. All prices in GH₵.
              </p>
            </div>
            <div className="admin-page__actions">
              <Link to="/admin" className="btn btn--outline">
                Back to dashboard
              </Link>
            </div>
          </header>

          {sample && (
            <div className="bra-box">
              <strong>Sample check:</strong> a 5-page business site with gallery, maps, SEO and hosting setup estimates at {formatCedis(sample.estimate)} (range{' '}
              {formatCedis(sample.range.low)} – {formatCedis(sample.range.high)}).
            </div>
          )}

          <div className="bra-price-grid">
            {SECTIONS.map((section) => {
              const obj = getAt(list, section.path) ?? {};
              const keys = Object.keys(obj).filter((k) => typeof obj[k] === 'number' && (!section.only || section.only.includes(k)) && k !== 'version');
              if (!keys.length) return null;
              return (
                <section key={section.title} className="bra-box">
                  <h3>{section.title}</h3>
                  {keys.map((key) => (
                    <label key={key} className="bra-price">
                      <span>{section.labels ? labelOf(section.labels, key) : humanize(key)}</span>
                      <input
                        type="number"
                        min={0}
                        step={key === 'rangePercent' ? 1 : 10}
                        className="bra-input"
                        value={obj[key]}
                        onChange={(event) => change(section.path, key, event.target.value)}
                      />
                    </label>
                  ))}
                </section>
              );
            })}
          </div>

          <details className="bra-box">
            <summary>Advanced: bundles, alternatives & manual-review lists (JSON)</summary>
            <p className="bra-muted">Edit with care. Missing keys fall back to defaults. Click “Apply JSON”, check the sample, then Save.</p>
            <textarea className="bra-input bra-json" rows={18} value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false} />
            <div className="bra-actions">
              <button type="button" className="btn btn--outline" onClick={applyJson}>
                Apply JSON
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  setList({ ...DEFAULT_PRICE_LIST, version: list.version });
                  setJson(JSON.stringify(DEFAULT_PRICE_LIST, null, 2));
                  setMessage('Defaults loaded — click Save to apply.');
                }}
              >
                Reset to defaults
              </button>
            </div>
          </details>

          <div className="bra-box bra-save">
            <input className="bra-input" placeholder="What changed? (saved in price history)" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />
            <button type="button" className="btn btn--primary" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save price list'}
            </button>
          </div>
          {message && (
            <p className="bra-message" role="status">
              {message}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
