import { OVERVIEW_STATUS_MAP } from '../../constants/requestStatuses';
import './admin.css';

const cards = [
  { key: 'total', label: 'Total Requests', tone: 'blue' },
  { key: 'pendingReview', label: 'Pending Reviews', tone: 'amber' },
  { key: 'quotationReady', label: 'Quotation Ready', tone: 'purple' },
  { key: 'inDevelopment', label: 'In Development', tone: 'indigo' },
  { key: 'completed', label: 'Completed', tone: 'green' },
];

export default function OverviewCards({ counts, isLoading }) {
  if (isLoading) {
    return (
      <div className="admin-overview">
        {cards.map((card) => (
          <div key={card.key} className="admin-overview__card admin-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="admin-overview">
      {cards.map((card) => (
        <article key={card.key} className={`admin-overview__card admin-overview__card--${card.tone}`}>
          <p className="admin-overview__label">{card.label}</p>
          <p className="admin-overview__value">{counts[card.key] ?? 0}</p>
          {card.key !== 'total' && (
            <p className="admin-overview__meta">Status: {OVERVIEW_STATUS_MAP[card.key]}</p>
          )}
        </article>
      ))}
    </div>
  );
}
