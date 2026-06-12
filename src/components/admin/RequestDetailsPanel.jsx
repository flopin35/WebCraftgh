import { useEffect, useState } from 'react';
import { REQUEST_STATUSES } from '../../constants/requestStatuses';
import { formatDateTime, formatPrice } from '../../utils/formatters';
import './admin.css';

export default function RequestDetailsPanel({
  request,
  onClose,
  onAdminUpdate,
  isUpdating,
  updateError,
}) {
  const [selectedStatus, setSelectedStatus] = useState('Pending Review');
  const [adminNotes, setAdminNotes] = useState('');
  const [requestProgress, setRequestProgress] = useState('');

  useEffect(() => {
    setSelectedStatus(request?.status ?? 'Pending Review');
    setAdminNotes(request?.adminNotes ?? '');
    setRequestProgress(request?.requestProgress ?? '');
  }, [request?.id, request?.status, request?.adminNotes, request?.requestProgress]);

  if (!request) {
    return (
      <aside className="admin-details admin-details--empty">
        <p>Select a request to view full details and update its status.</p>
      </aside>
    );
  }

  const selectedUpgrades = request.selectedUpgrades ?? request.selectedFeatures ?? [];
  const pricing = request.pricing ?? {};

  const handleSave = async () => {
    await onAdminUpdate(request.id, {
      status: selectedStatus,
      adminNotes,
      requestProgress,
    });
  };

  const hasChanges =
    selectedStatus !== request.status ||
    adminNotes !== (request.adminNotes ?? '') ||
    requestProgress !== (request.requestProgress ?? '');

  return (
    <aside className="admin-details">
      <div className="admin-details__header">
        <div>
          <p className="admin-details__label">Request Details</p>
          <h2>{request.receiptId}</h2>
        </div>
        <button type="button" className="admin-details__close" onClick={onClose} aria-label="Close details">
          ×
        </button>
      </div>

      <section className="admin-details__section">
        <h3>Trust &amp; Tracking</h3>
        <dl className="admin-details__list">
          <div>
            <dt>Receipt ID</dt>
            <dd className="admin-details__mono">{request.receiptId}</dd>
          </div>
          <div>
            <dt>Firestore Document ID</dt>
            <dd className="admin-details__mono">{request.id}</dd>
          </div>
          <div>
            <dt>Created Date</dt>
            <dd>{formatDateTime(request.createdAt)}</dd>
          </div>
          <div>
            <dt>Last Updated</dt>
            <dd>{formatDateTime(request.updatedAt || request.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-details__section">
        <h3>Customer Details</h3>
        <dl className="admin-details__list">
          <div>
            <dt>Full Name</dt>
            <dd>{request.customer.fullName || '—'}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{request.customer.phone || '—'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{request.customer.email || '—'}</dd>
          </div>
          <div>
            <dt>Business Name</dt>
            <dd>{request.customer.businessName || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-details__section">
        <h3>Selected Template</h3>
        <p className="admin-details__highlight">{request.template.name}</p>
        <p>{formatPrice(request.template.price)}</p>
      </section>

      {request.selectedBundle && (
        <section className="admin-details__section">
          <h3>Selected Bundle</h3>
          <p className="admin-details__highlight">{request.selectedBundle.name}</p>
          <p>{formatPrice(request.selectedBundle.price)}</p>
        </section>
      )}

      <section className="admin-details__section">
        <h3>Selected Upgrades</h3>
        {selectedUpgrades.length ? (
          <ul className="admin-details__features">
            {selectedUpgrades.map((upgrade) => (
              <li key={upgrade.id}>
                <span>{upgrade.name}</span>
                <span>{formatPrice(upgrade.price)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-details__muted">No paid upgrades selected.</p>
        )}
      </section>

      <section className="admin-details__section">
        <h3>Deployment Option</h3>
        <p>{request.deployment ? 'Professional Deployment & Setup included' : 'Not included'}</p>
      </section>

      <section className="admin-details__section">
        <h3>Pricing Breakdown</h3>
        <dl className="admin-details__list">
          <div>
            <dt>Base Template</dt>
            <dd>{formatPrice(pricing.templatePrice ?? request.template.price)}</dd>
          </div>
          <div>
            <dt>Selected Upgrades</dt>
            <dd>{formatPrice(pricing.upgradesSubtotal ?? 0)}</dd>
          </div>
          {pricing.bundleDiscount > 0 && (
            <div>
              <dt>Bundle Discount</dt>
              <dd>Save {formatPrice(pricing.bundleDiscount)}</dd>
            </div>
          )}
          <div>
            <dt>Deployment</dt>
            <dd>{formatPrice(pricing.deploymentFee ?? (request.deployment ? 600 : 0))}</dd>
          </div>
        </dl>
        <p className="admin-details__price">{formatPrice(request.totalPrice)}</p>
      </section>

      <section className="admin-details__section">
        <h3>Customer Notes</h3>
        <p className="admin-details__notes">{request.notes || 'No additional notes provided.'}</p>
      </section>

      <section className="admin-details__section">
        <h3>Status Management</h3>
        <label className="admin-details__field" htmlFor="requestStatus">
          Update Status
        </label>
        <select
          id="requestStatus"
          className="admin-details__select"
          value={selectedStatus}
          disabled={isUpdating}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          {REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <label className="admin-details__field" htmlFor="requestProgress">
          Request Progress
        </label>
        <textarea
          id="requestProgress"
          className="admin-details__textarea"
          value={requestProgress}
          disabled={isUpdating}
          onChange={(event) => setRequestProgress(event.target.value)}
          placeholder="Track development milestones or next steps..."
        />

        <label className="admin-details__field" htmlFor="adminNotes">
          Admin Notes
        </label>
        <textarea
          id="adminNotes"
          className="admin-details__textarea"
          value={adminNotes}
          disabled={isUpdating}
          onChange={(event) => setAdminNotes(event.target.value)}
          placeholder="Internal notes visible only to administrators..."
        />

        {updateError && (
          <p className="admin-details__error" role="alert">
            {updateError}
          </p>
        )}

        <button
          type="button"
          className="btn btn--primary btn--full"
          disabled={isUpdating || !hasChanges}
          onClick={handleSave}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </section>
    </aside>
  );
}
