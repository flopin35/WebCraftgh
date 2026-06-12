import { trustPoints } from '../../data/upgrades';
import './TrustSection.css';

export default function TrustSection() {
  return (
    <section className="trust section">
      <div className="container">
        <div className="section__header">
          <h2 className="section__title">Why Businesses Trust Us</h2>
          <p className="section__subtitle">
            Fair, transparent pricing with professional development you can rely on.
          </p>
        </div>
        <ul className="trust__grid">
          {trustPoints.map((point) => (
            <li key={point} className="trust__item">
              <span className="trust__icon" aria-hidden="true">
                ✓
              </span>
              <p>{point}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
