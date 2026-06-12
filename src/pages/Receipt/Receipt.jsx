import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { bugFixGuarantee } from '../../data/upgrades';
import { getLatestRequest } from '../../services/requestService';
import { isValidReceiptId } from '../../utils/generateReceipt';
import './Receipt.css';

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(amount) {
  return `GHS ${Number(amount || 0).toLocaleString()}`;
}

export default function Receipt() {
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const latestRequest = getLatestRequest();

    if (!latestRequest?.receiptId || !isValidReceiptId(latestRequest.receiptId)) {
      navigate('/', { replace: true });
      return;
    }

    setRequest(latestRequest);
  }, [navigate]);

  if (!request) {
    return null;
  }

  const pricing = request.pricing ?? {};
  const selectedUpgrades = request.selectedUpgrades ?? request.selectedFeatures ?? [];

  return (
    <>
      <Navbar />

      <main className="receipt-page">
        <div className="container">
          <section className="receipt-card" aria-labelledby="receipt-title">
            <div className="receipt-card__icon" aria-hidden="true">
              ✅
            </div>

            <h1 id="receipt-title" className="receipt-card__title">
              Request Received Successfully
            </h1>

            <p className="receipt-card__intro">
              Your delivery receipt has been generated. Keep this reference for your records.
            </p>

            <dl className="receipt-card__details">
              <div className="receipt-card__row receipt-card__row--highlight">
                <dt>Receipt ID</dt>
                <dd>{request.receiptId}</dd>
              </div>
              <div className="receipt-card__row">
                <dt>Status</dt>
                <dd>
                  <span className="receipt-card__status">{request.status}</span>
                </dd>
              </div>
              <div className="receipt-card__row">
                <dt>Review Time</dt>
                <dd>24-48 Hours</dd>
              </div>
              <div className="receipt-card__row">
                <dt>Selected Template</dt>
                <dd>{request.template.name}</dd>
              </div>
              <div className="receipt-card__row">
                <dt>Base Template Price</dt>
                <dd>{formatPrice(pricing.templatePrice ?? request.template.price)}</dd>
              </div>
              {request.selectedBundle && (
                <div className="receipt-card__row">
                  <dt>Selected Bundle</dt>
                  <dd>{request.selectedBundle.name}</dd>
                </div>
              )}
              {selectedUpgrades.length > 0 && (
                <div className="receipt-card__row">
                  <dt>Selected Upgrades</dt>
                  <dd>{selectedUpgrades.map((item) => item.name).join(', ')}</dd>
                </div>
              )}
              {pricing.bundleDiscount > 0 && (
                <div className="receipt-card__row">
                  <dt>Bundle Discount</dt>
                  <dd>Save {formatPrice(pricing.bundleDiscount)}</dd>
                </div>
              )}
              <div className="receipt-card__row">
                <dt>Deployment Cost</dt>
                <dd>{formatPrice(pricing.deploymentFee ?? (request.deployment ? 600 : 0))}</dd>
              </div>
              <div className="receipt-card__row">
                <dt>Final Total</dt>
                <dd className="receipt-card__price">{formatPrice(request.totalPrice)}</dd>
              </div>
              <div className="receipt-card__row">
                <dt>Date Submitted</dt>
                <dd>{formatDate(request.dateSubmitted)}</dd>
              </div>
            </dl>

            <div className="receipt-card__message">
              <p>You will be contacted once your review is complete.</p>
            </div>

            <div className="receipt-card__guarantee">
              <h2>{bugFixGuarantee.title}</h2>
              <p>{bugFixGuarantee.message}</p>
              <p className="receipt-card__guarantee-note">{bugFixGuarantee.note}</p>
            </div>

            <div className="receipt-card__contact">
              <h2>Contact</h2>
              <ul>
                <li>
                  <a href="tel:0509002402">0509002402</a>
                </li>
                <li>
                  <a href="mailto:campaignhubgh@gmail.com">campaignhubgh@gmail.com</a>
                </li>
              </ul>
            </div>

            <Link to="/" className="btn btn--primary btn--full receipt-card__home">
              Return Home
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
