import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { getLatestCustomRequest } from '../../services/customWebsiteService';
import { isValidCustomReceiptId } from '../../utils/generateCustomReceipt';
import './CustomReceipt.css';

export default function CustomReceipt() {
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const latestRequest = getLatestCustomRequest();

    if (!latestRequest?.receiptId || !isValidCustomReceiptId(latestRequest.receiptId)) {
      navigate('/', { replace: true });
      return;
    }

    setRequest(latestRequest);
  }, [navigate]);

  if (!request) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="custom-receipt-page">
        <div className="container">
          <section className="custom-receipt-card" aria-labelledby="custom-receipt-title">
            <div className="custom-receipt-card__icon" aria-hidden="true">
              ✅
            </div>

            <h1 id="custom-receipt-title" className="custom-receipt-card__title">
              Custom Website Request Submitted Successfully
            </h1>

            <dl className="custom-receipt-card__details">
              <div className="custom-receipt-card__row custom-receipt-card__row--highlight">
                <dt>Receipt ID</dt>
                <dd>{request.receiptId}</dd>
              </div>
              <div className="custom-receipt-card__row">
                <dt>Business</dt>
                <dd>{request.customer?.businessName || '—'}</dd>
              </div>
              <div className="custom-receipt-card__row">
                <dt>Estimated Range</dt>
                <dd>{request.leadSummary?.budget || request.estimatedPriceRange || '—'}</dd>
              </div>
              {request.leadSummary?.timeline && (
                <div className="custom-receipt-card__row">
                  <dt>Timeline</dt>
                  <dd>{request.leadSummary.timeline}</dd>
                </div>
              )}
            </dl>

            <div className="custom-receipt-card__message">
              <p>
                We will review your request and contact you with a quotation. Keep this receipt ID
                for future reference.
              </p>
            </div>

            <Link to="/" className="btn btn--primary btn--full custom-receipt-card__home">
              Return Home
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
