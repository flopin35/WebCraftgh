import { formatDateTime } from '../../utils/formatters';
import './admin.css';

function StatusBadge({ status }) {
  const tone = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`admin-status admin-status--${tone}`}>{status}</span>;
}

export default function CustomRequestsTable({ requests, selectedId, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <section className="admin-table-card">
        <div className="admin-table-card__header">
          <h2>Custom Website Requests</h2>
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
          <h2>Custom Website Requests</h2>
        </div>
        <p className="admin-table__empty">No custom website requests yet.</p>
      </section>
    );
  }

  return (
    <section className="admin-table-card">
      <div className="admin-table-card__header">
        <h2>Custom Website Requests</h2>
        <p>{requests.length} result{requests.length === 1 ? '' : 's'}</p>
      </div>

      <div className="admin-table__wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Customer</th>
              <th>Business</th>
              <th>Lead Score</th>
              <th>Est. Range</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className={selectedId === request.id ? 'is-selected' : ''}
                onClick={() => onSelect(request)}
              >
                <td>{request.receiptId}</td>
                <td>{request.customer.fullName || '—'}</td>
                <td>{request.customer.businessName || '—'}</td>
                <td>
                  {request.leadSummary?.leadScore != null ? (
                    <span className="admin-lead-score">{request.leadSummary.leadScore}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{request.estimatedPriceRange}</td>
                <td><StatusBadge status={request.status} /></td>
                <td>{formatDateTime(request.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
