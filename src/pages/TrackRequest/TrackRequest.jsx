import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { fetchRequestStatus, sendCustomerReply } from '../../services/builderService';
import { formatCedis } from '../../utils/builderPricing';
import '../../components/builder/builder.css';

const STATUS_HELP = {
  'Pending Review': 'We have your brief and will review it shortly.',
  'Needs Information': 'We need a little more information — please reply below.',
  Reviewing: 'Our team is reviewing your requirements and preparing a quotation.',
  'Quotation Sent': 'Your quotation is ready. Please review and accept or decline it below.',
  'Quote Accepted': 'Thank you! We will contact you to schedule the project.',
  'Quote Declined': 'You declined the quotation. Reply below if you would like to discuss changes.',
  'In Development': 'Your website is being built.',
  Completed: 'Your project is complete.',
  Cancelled: 'This request has been closed.',
};

export default function TrackRequest() {
  const [params, setParams] = useSearchParams();
  const [reference, setReference] = useState(params.get('ref') ?? '');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [replyState, setReplyState] = useState('');

  const lookup = useCallback(async (ref) => {
    setLoading(true);
    setError('');
    const result = await fetchRequestStatus(ref);
    setLoading(false);
    if (!result.success) {
      setStatus(null);
      setError(result.error);
      return;
    }
    setStatus(result.status);
  }, []);

  useEffect(() => {
    const ref = params.get('ref');
    if (ref) lookup(ref);
  }, [params, lookup]);

  const send = async (type) => {
    setReplyState('sending');
    const result = await sendCustomerReply({ receiptId: status.receiptId, type, message: reply });
    if (!result.success) {
      setReplyState(result.error);
      return;
    }
    setReply('');
    setReplyState(
      type === 'accept-quote'
        ? 'Thank you — your acceptance has been sent. We will be in touch to confirm next steps.'
        : type === 'decline-quote'
          ? 'Your response has been sent.'
          : 'Message sent. We will get back to you soon.'
    );
  };

  return (
    <>
      <Navbar />
      <main className="bld-page">
        <div className="container bld-track">
          <h1>Track your request</h1>
          <form
            className="bld-track__form"
            onSubmit={(event) => {
              event.preventDefault();
              setParams({ ref: reference.trim().toUpperCase() });
            }}
          >
            <label htmlFor="ref" className="bld-field__label">
              Reference number
            </label>
            <div className="bld-track__row">
              <input
                id="ref"
                className="bld-field__input"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="WB-XXXXXXXX or CE-XXXXXXXX"
                maxLength={20}
                autoCapitalize="characters"
              />
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Checking…' : 'Check status'}
              </button>
            </div>
          </form>
          {error && (
            <p className="bld-errors" role="alert">
              {error}
            </p>
          )}

          {status && (
            <section className="bld-track__card" aria-live="polite">
              <p className="bld-note">{status.receiptId}</p>
              <h2>
                Status: <span className="bld-status">{status.status}</span>
              </h2>
              <p>{STATUS_HELP[status.status] ?? ''}</p>

              {status.customerMessage && (
                <div className="bld-callout bld-callout--info">
                  <strong>Message from WebCraft</strong>
                  <p>{status.customerMessage}</p>
                </div>
              )}

              {status.quote?.amount && (
                <div className="bld-quote">
                  <span>Your quotation</span>
                  <strong>{formatCedis(status.quote.amount)}</strong>
                  {status.quote.validUntil && <small>Valid until {status.quote.validUntil}</small>}
                  {status.quote.terms && <p>{status.quote.terms}</p>}
                  {status.quote.sentAt && ['Quotation Sent', 'Needs Information', 'Reviewing'].includes(status.status) && (
                    <div className="bld-quote__actions">
                      <button type="button" className="btn btn--primary" onClick={() => send('accept-quote')} disabled={replyState === 'sending'}>
                        Accept quotation
                      </button>
                      <button type="button" className="btn btn--outline" onClick={() => send('decline-quote')} disabled={replyState === 'sending'}>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="bld-field">
                <label htmlFor="reply" className="bld-field__label">
                  {status.status === 'Needs Information' ? 'Your answer' : 'Send us a message'}
                </label>
                <textarea id="reply" className="bld-field__input" rows={4} maxLength={3000} value={reply} onChange={(event) => setReply(event.target.value)} />
              </div>
              <button type="button" className="btn btn--outline" onClick={() => send('message')} disabled={replyState === 'sending' || reply.trim().length < 2}>
                Send message
              </button>
              {replyState && replyState !== 'sending' && (
                <p className="bld-note" role="status">
                  {replyState}
                </p>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
