import { useEffect, useMemo, useState } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { BUDGET_TIERS, BUILDER_STATUSES, WEBSITE_TYPES, labelOf } from '../../../data/builder/builderOptions';
import { storage } from '../../../firebase';
import { markReplyHandled, subscribeToBuilderRequests, subscribeToCustomerReplies, updateBuilderRequest } from '../../../services/adminBuilderService';
import { formatCedis } from '../../../utils/builderPricing';
import './builderAdmin.css';

const formatDate = (value) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

function useFileUrls(files) {
  const [urls, setUrls] = useState({});
  useEffect(() => {
    let cancelled = false;
    if (!files?.length || !storage) {
      setUrls({});
      return undefined;
    }
    Promise.all(
      files.map(async (file) => {
        try {
          return [file.storagePath, await getDownloadURL(ref(storage, file.storagePath))];
        } catch {
          return [file.storagePath, null];
        }
      })
    ).then((entries) => !cancelled && setUrls(Object.fromEntries(entries)));
    return () => {
      cancelled = true;
    };
  }, [files]);
  return urls;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function quoteMessage(request, quote) {
  const name = request.customer?.fullName?.split(' ')[0] || 'there';
  return [
    `Hello ${name},`,
    '',
    `Thank you for your WebCraft project brief (${request.receiptId}). After reviewing your requirements, our quotation is ${formatCedis(quote.amount)}.`,
    quote.validUntil ? `This quotation is valid until ${quote.validUntil}.` : '',
    quote.terms ? `\n${quote.terms}` : '',
    '',
    `You can accept or decline it here: ${window.location.origin}/track?ref=${request.receiptId}`,
    '',
    'Best regards,',
    'WebCraft GH',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

function DetailPanel({ request, replies, onClose }) {
  const urls = useFileUrls(request.uploadedFiles);
  const [status, setStatus] = useState(request.status);
  const [notes, setNotes] = useState(request.adminNotes ?? '');
  const [quote, setQuote] = useState({
    amount: request.quote?.amount ?? request.estimate?.amount ?? '',
    reason: '',
    validUntil: request.quote?.validUntil ?? '',
    terms: request.quote?.terms ?? '50% deposit to start, 50% on launch. Includes 2 rounds of revisions.',
  });
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(request.status);
    setNotes(request.adminNotes ?? '');
  }, [request.id, request.status, request.adminNotes]);

  const run = async (fields, success) => {
    setBusy(true);
    setMessage('');
    const result = await updateBuilderRequest(request, fields);
    setBusy(false);
    setMessage(result.success ? success : result.error);
  };

  const quoteText = quote.amount ? quoteMessage(request, { ...quote, amount: Number(quote.amount) }) : '';
  const phone = (request.customer?.phone ?? '').replace(/[^\d]/g, '').replace(/^0/, '233');
  const e = request.estimate;

  return (
    <aside className="bra-detail" aria-label={`Request ${request.receiptId}`}>
      <header className="bra-detail__head">
        <div>
          <p className="bra-muted">{request.requestKind === 'custom-estimate' ? 'Custom estimate request' : 'Builder brief'}</p>
          <h2>{request.receiptId}</h2>
          <p>
            {request.customer?.fullName} · {request.customer?.businessName || '—'}
          </p>
          <p className="bra-muted">
            <a href={`mailto:${request.customer?.email}`}>{request.customer?.email}</a> · {request.customer?.phone || '—'} · prefers{' '}
            {request.customer?.contactMethod}
          </p>
        </div>
        <button type="button" className="bra-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>

      {replies.length > 0 && (
        <section className="bra-box bra-box--alert">
          <h3>Customer replies</h3>
          {replies.map((reply) => (
            <div key={reply.id} className={`bra-reply${reply.handled ? ' is-handled' : ''}`}>
              <strong>{reply.type === 'accept-quote' ? '✅ Accepted quotation' : reply.type === 'decline-quote' ? '❌ Declined quotation' : '💬 Message'}</strong>
              {reply.message && <p>{reply.message}</p>}
              <small>{formatDate(reply.createdAt)}</small>
              {!reply.handled && (
                <button type="button" className="bld-link-btn" onClick={() => markReplyHandled(reply.id)}>
                  Mark handled
                </button>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="bra-box">
        <h3>Status & notes</h3>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="bra-input">
          {BUILDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <textarea className="bra-input" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Internal notes (not visible to customer)" />
        <button type="button" className="btn btn--primary" disabled={busy} onClick={() => run({ status, adminNotes: notes }, 'Saved.')}>
          Save status & notes
        </button>
      </section>

      {e && (
        <section className="bra-box">
          <h3>Calculated estimate</h3>
          <p>
            <strong>{formatCedis(e.amount)}</strong> (range {formatCedis(e.low)} – {formatCedis(e.high)}) · budget {formatCedis(request.budgetAmount)}
            {e.overBudget && <span className="bra-tag bra-tag--warn">over budget</span>}
            {e.needsManualReview && <span className="bra-tag">manual review</span>}
            {e.exceedsBuilderCap && <span className="bra-tag bra-tag--warn">&gt; GH₵10k</span>}
          </p>
          <details>
            <summary>Line items ({e.lineItems?.length ?? 0})</summary>
            <ul className="bra-lines">
              {e.lineItems?.map((item, i) => (
                <li key={i}>
                  <span>{item.label}</span>
                  <span>{formatCedis(item.amount)}</span>
                </li>
              ))}
              {e.bundleDiscount > 0 && (
                <li>
                  <span>Bundle discounts</span>
                  <span>−{formatCedis(e.bundleDiscount)}</span>
                </li>
              )}
            </ul>
          </details>
          {e.manualReview?.length > 0 && (
            <ul className="bra-flags">
              {e.manualReview.map((m, i) => (
                <li key={i}>
                  ⚑ {m.label} — {m.reason}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="bra-box">
        <h3>Quotation</h3>
        <div className="bra-grid">
          <label>
            Amount (GH₵)
            <input className="bra-input" type="number" min={0} value={quote.amount} onChange={(event) => setQuote({ ...quote, amount: event.target.value })} />
          </label>
          <label>
            Valid until
            <input className="bra-input" type="date" value={quote.validUntil} onChange={(event) => setQuote({ ...quote, validUntil: event.target.value })} />
          </label>
        </div>
        <input className="bra-input" placeholder="Reason for adjustment (saved in audit trail)" value={quote.reason} onChange={(event) => setQuote({ ...quote, reason: event.target.value })} />
        <textarea className="bra-input" rows={3} value={quote.terms} onChange={(event) => setQuote({ ...quote, terms: event.target.value })} placeholder="Terms shown to the customer" />
        <div className="bra-actions">
          <button type="button" className="btn btn--outline" disabled={busy || !quote.amount} onClick={() => run({ quote: { ...quote, send: false } }, 'Quote draft saved.')}>
            Save draft quote
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={busy || !quote.amount}
            onClick={() => run({ quote: { ...quote, send: true } }, 'Quotation published to the customer’s tracking page. Now notify them below.')}
          >
            Publish quotation
          </button>
        </div>
        {quoteText && (
          <div className="bra-actions">
            <a className="btn btn--outline" href={`mailto:${request.customer?.email}?subject=${encodeURIComponent(`Your WebCraft quotation ${request.receiptId}`)}&body=${encodeURIComponent(quoteText)}`}>
              Email quotation
            </a>
            {phone && (
              <a className="btn btn--outline" href={`https://wa.me/${phone}?text=${encodeURIComponent(quoteText)}`} target="_blank" rel="noreferrer">
                WhatsApp quotation
              </a>
            )}
          </div>
        )}
        {request.quote?.amount && (
          <p className="bra-muted">
            Current quote: {formatCedis(request.quote.amount)} {request.quote.sentAt ? `· sent ${formatDate(request.quote.sentAt)}` : '· draft'}
          </p>
        )}
        {request.quoteHistory?.length > 0 && (
          <details>
            <summary>Audit trail ({request.quoteHistory.length} changes)</summary>
            <ol className="bra-audit">
              {[...request.quoteHistory].reverse().map((h, i) => (
                <li key={i}>
                  <strong>{formatCedis(h.amount)}</strong>
                  {h.previousAmount != null && <> (was {formatCedis(h.previousAmount)})</>} — {h.reason || 'no reason given'}
                  <br />
                  <small>
                    {h.by} · {formatDate(h.at)}
                  </small>
                </li>
              ))}
            </ol>
          </details>
        )}
      </section>

      <section className="bra-box">
        <h3>Request missing information</h3>
        <textarea className="bra-input" rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Question shown on the customer's tracking page" />
        <button
          type="button"
          className="btn btn--outline"
          disabled={busy || question.trim().length < 5}
          onClick={async () => {
            await run({ clarification: question.trim() }, 'Question posted. Status set to "Needs Information".');
            setQuestion('');
          }}
        >
          Ask customer
        </button>
        {request.clarifications?.length > 0 && (
          <ul className="bra-flags">
            {request.clarifications.map((c, i) => (
              <li key={i}>
                {c.question} <small>({formatDate(c.at)})</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      {message && (
        <p className="bra-message" role="status">
          {message}
        </p>
      )}

      {request.uploadedFiles?.length > 0 && (
        <section className="bra-box">
          <h3>Uploaded assets</h3>
          <div className="bra-files">
            {request.uploadedFiles.map((file) => (
              <a key={file.storagePath} href={urls[file.storagePath] ?? '#'} target="_blank" rel="noreferrer" className="bra-file">
                {file.type?.startsWith('image/') && urls[file.storagePath] ? <img src={urls[file.storagePath]} alt={file.name} /> : <span>📄</span>}
                <small>
                  {file.category}: {file.name}
                </small>
              </a>
            ))}
          </div>
        </section>
      )}
      {request.missingContent?.length > 0 && (
        <section className="bra-box">
          <h3>Missing content</h3>
          <ul className="bra-flags">
            {request.missingContent.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="bra-box">
        <div className="bra-actions">
          <h3>Full specification</h3>
          <button type="button" className="btn btn--outline" onClick={() => download(`${request.receiptId}-brief.txt`, request.brief ?? '', 'text/plain')}>
            Export brief (.txt)
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              const { id: _id, ...data } = request;
              download(`${request.receiptId}-spec.json`, JSON.stringify(data, null, 2), 'application/json');
            }}
          >
            Export JSON
          </button>
        </div>
        <pre className="bra-brief">{request.brief}</pre>
      </section>
    </aside>
  );
}

export default function BuilderRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [replies, setReplies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', tier: '', type: '', kind: '' });

  useEffect(() => {
    const unsubRequests = subscribeToBuilderRequests(
      (data) => {
        setRequests(data);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Unable to load builder requests.');
        setLoading(false);
      }
    );
    const unsubReplies = subscribeToCustomerReplies(setReplies);
    return () => {
      unsubRequests();
      unsubReplies();
    };
  }, []);

  const unhandled = useMemo(() => {
    const map = {};
    for (const reply of replies) if (!reply.handled) map[reply.receiptId] = (map[reply.receiptId] ?? 0) + 1;
    return map;
  }, [replies]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return requests.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.type && r.websiteType !== filters.type) return false;
      if (filters.kind && r.requestKind !== filters.kind) return false;
      if (filters.tier) {
        const tier = BUDGET_TIERS.find((t) => t.id === filters.tier);
        if (filters.tier === 'custom' ? r.requestKind !== 'custom-estimate' : !(r.budgetAmount >= tier.min && r.budgetAmount <= tier.max)) return false;
      }
      if (q) {
        const hay = `${r.receiptId} ${r.customer?.fullName} ${r.customer?.businessName} ${r.customer?.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, filters]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'Pending Review').length,
    custom: requests.filter((r) => r.requestKind === 'custom-estimate').length,
    quoted: requests.filter((r) => r.status === 'Quotation Sent').length,
    accepted: requests.filter((r) => r.status === 'Quote Accepted').length,
    replies: Object.values(unhandled).reduce((a, b) => a + b, 0),
  };
  const set = (key) => (event) => setFilters((f) => ({ ...f, [key]: event.target.value }));

  const exportCsv = () => {
    const header = ['Reference', 'Kind', 'Date', 'Name', 'Business', 'Email', 'Phone', 'Type', 'Budget', 'Estimate', 'Quote', 'Status'];
    const rows = filtered.map((r) => [
      r.receiptId,
      r.requestKind,
      formatDate(r.createdAt),
      r.customer?.fullName,
      r.customer?.businessName,
      r.customer?.email,
      r.customer?.phone,
      labelOf(WEBSITE_TYPES, r.websiteType),
      r.budgetAmount || r.budgetTier,
      r.estimate?.amount ?? '',
      r.quote?.amount ?? '',
      r.status,
    ]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    download(`webcraft-builder-requests-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv');
  };

  return (
    <div className="bra">
      <div className="bra-stats">
        {[
          ['Total', counts.total],
          ['Pending review', counts.pending],
          ['Custom estimates', counts.custom],
          ['Quotes sent', counts.quoted],
          ['Accepted', counts.accepted],
          ['Unread replies', counts.replies],
        ].map(([label, value]) => (
          <div key={label} className="bra-stat">
            <strong>{loading ? '…' : value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="bra-filters">
        <input className="bra-input" placeholder="Search name, email, reference" value={filters.search} onChange={set('search')} />
        <select className="bra-input" value={filters.status} onChange={set('status')} aria-label="Filter by status">
          <option value="">All statuses</option>
          {BUILDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="bra-input" value={filters.tier} onChange={set('tier')} aria-label="Filter by budget">
          <option value="">All budgets</option>
          {BUDGET_TIERS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
          <option value="custom">Custom estimate</option>
        </select>
        <select className="bra-input" value={filters.type} onChange={set('type')} aria-label="Filter by website type">
          <option value="">All website types</option>
          {WEBSITE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select className="bra-input" value={filters.kind} onChange={set('kind')} aria-label="Filter by request kind">
          <option value="">Builder + custom</option>
          <option value="builder">Builder briefs</option>
          <option value="custom-estimate">Custom estimates</option>
        </select>
        <button type="button" className="btn btn--outline" onClick={exportCsv} disabled={!filtered.length}>
          Export CSV
        </button>
      </div>

      {error && (
        <p className="admin-page__error" role="alert">
          {error}
        </p>
      )}

      <div className={`bra-body${selected ? ' has-detail' : ''}`}>
        <div className="bra-table-wrap">
          <table className="bra-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Client</th>
                <th>Type</th>
                <th>Budget</th>
                <th>Estimate</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="bra-empty">
                    No requests match these filters.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className={r.id === selectedId ? 'is-selected' : ''} onClick={() => setSelectedId(r.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedId(r.id)}>
                  <td>
                    <strong>{r.receiptId}</strong>
                    {r.requestKind === 'custom-estimate' && <span className="bra-tag">custom</span>}
                    {unhandled[r.receiptId] && <span className="bra-tag bra-tag--warn">{unhandled[r.receiptId]} new</span>}
                  </td>
                  <td>
                    {r.customer?.fullName}
                    <br />
                    <small>{r.customer?.businessName}</small>
                  </td>
                  <td>{labelOf(WEBSITE_TYPES, r.websiteType)}</td>
                  <td>{r.budgetAmount ? formatCedis(r.budgetAmount) : r.budgetTier}</td>
                  <td>
                    {r.estimate ? formatCedis(r.estimate.amount) : '—'}
                    {r.estimate?.overBudget && <span className="bra-tag bra-tag--warn">over</span>}
                  </td>
                  <td>{r.status}</td>
                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && <DetailPanel key={selected.id} request={selected} replies={replies.filter((reply) => reply.receiptId === selected.receiptId)} onClose={() => setSelectedId(null)} />}
      </div>
    </div>
  );
}
