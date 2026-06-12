import { formatDateTime, formatPrice } from '../../utils/formatters';
import './admin.css';

function StatusBadge({ status }) {
  const tone = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`admin-status admin-status--${tone}`}>{status}</span>;
}

export default function RequestsTable({ requests, selectedId, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <section className="admin-table-card">
        <div className="admin-table-card__header">
          <h2>Requests</h2>
        </div>
        <div className="admin-table__skeleton">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="admin-skeleton admin-skeleton--row" />
          ))}
        </div>
      </section>
    );
  }

  if (!requests.length) {
    return (
      <section className="admin-table-card">
        <div className="admin-table-card__header">
          <h2>Requests</h2>
        </div>
        <p className="admin-table__empty">No requests match your current filters.</p>
      </section>
    );
  }

  return (
    <section className="admin-table-card">
      <div className="admin-table-card__header">
        <h2>Requests</h2>
        <p>{requests.length} result{requests.length === 1 ? '' : 's'}</p>
      </div>

      <div className="admin-table__wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Template</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Date Submitted</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className={selectedId === request.id ? 'is-selected' : ''}
                onClick={() => onSelect(request)}
              >
                <td data-label="Receipt ID">{request.receiptId}</td>
                <td data-label="Customer">{request.customer.fullName || '—'}</td>
                <td data-label="Phone">{request.customer.phone || '—'}</td>
                <td data-label="Template">{request.template.name || '—'}</td>
                <td data-label="Total Price">{formatPrice(request.totalPrice)}</td>
                <td data-label="Status">
                  <StatusBadge status={request.status} />
                </td>
                <td data-label="Date Submitted">{formatDateTime(request.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-cards">
        {requests.map((request) => (
          <button
            key={request.id}
            type="button"
            className={`admin-card${selectedId === request.id ? ' is-selected' : ''}`}
            onClick={() => onSelect(request)}
          >
            <div className="admin-card__top">
              <strong>{request.receiptId}</strong>
              <StatusBadge status={request.status} />
            </div>
            <p>{request.customer.fullName}</p>
            <p>{request.customer.phone}</p>
            <p>{request.template.name}</p>
            <p>{formatPrice(request.totalPrice)}</p>
            <p className="admin-card__date">{formatDateTime(request.createdAt)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
