import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { getLatestBuilderRequest } from '../../services/builderService';
import { formatCedis } from '../../utils/builderPricing';
import '../../components/builder/builder.css';

export default function BuilderSubmitted() {
  const location = useLocation();
  const request = location.state?.request ?? getLatestBuilderRequest();
  const [copied, setCopied] = useState(false);

  if (!request) {
    return (
      <>
        <Navbar />
        <main className="bld-page">
          <div className="container bld-done">
            <h1>No recent submission found</h1>
            <p>
              <Link to="/build">Start building your website</Link> or <Link to="/track">track an existing request</Link>.
            </p>
          </div>
        </main>
      </>
    );
  }

  const isEstimate = request.requestKind === 'custom-estimate';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(request.receiptId);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const fullBrief = request.brief ?? '';
  const mailBody = encodeURIComponent(fullBrief.length > 1500 ? `${fullBrief.slice(0, 1500)}\n…\n(Use "Download brief" for the full version.)` : fullBrief);
  const mailto = `mailto:${request.customer?.email ?? ''}?subject=${encodeURIComponent(`My WebCraft project brief ${request.receiptId}`)}&body=${mailBody}`;
  const downloadBrief = () => {
    const blob = new Blob([request.brief ?? ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webcraft-brief-${request.receiptId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <main className="bld-page">
        <div className="container bld-done">
          <div className="bld-done__icon" aria-hidden="true">
            ✓
          </div>
          <h1>{isEstimate ? 'Custom estimate request received' : 'Your project brief has been submitted'}</h1>
          <p>Thank you{request.customer?.fullName ? `, ${request.customer.fullName.split(' ')[0]}` : ''}. Your reference number is:</p>
          <div className="bld-done__ref">
            <strong>{request.receiptId}</strong>
            <button type="button" className="bld-link-btn" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="bld-note">Keep this number — you'll need it to track your request.</p>

          {!isEstimate && request.estimate && (
            <p>
              Your estimate: <strong>{formatCedis(request.estimate.amount)}</strong> (range {formatCedis(request.estimate.low)} – {formatCedis(request.estimate.high)}). This is
              not a final price.
            </p>
          )}

          {request.warnings?.length > 0 && (
            <div className="bld-callout bld-callout--warn">
              <strong>Some files could not be uploaded</strong>
              <ul>
                {request.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <p>You can send them to us later — just quote your reference number.</p>
            </div>
          )}

          <div className="bld-done__next">
            <h2>What happens next</h2>
            <ol>
              <li>Our team reviews your brief{isEstimate ? ' and requirements' : ' and checks the estimate'} — usually within 1–2 business days.</li>
              <li>If anything is unclear we'll ask you here and by your preferred contact method.</li>
              <li>You receive a final quotation to accept or decline. No payment is needed until you accept.</li>
            </ol>
          </div>

          <div className="bld-done__actions">
            <Link to={`/track?ref=${request.receiptId}`} className="btn btn--primary">
              Track this request
            </Link>
            <button type="button" className="btn btn--outline" onClick={downloadBrief}>
              Download brief
            </button>
            <a href={mailto} className="btn btn--outline">
              Email me a copy
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
