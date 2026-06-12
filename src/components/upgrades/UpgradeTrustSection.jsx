import { bugFixGuarantee, trustPoints } from '../../data/upgrades';
import './WebsiteUpgrades.css';

export default function UpgradeTrustSection() {
  return (
    <section className="upgrade-trust request-card" aria-labelledby="upgrade-trust-title">
      <h2 id="upgrade-trust-title" className="request-card__title">
        Why Choose WebCraft
      </h2>

      <ul className="upgrade-trust__list">
        {trustPoints.map((point) => (
          <li key={point}>
            <span aria-hidden="true">✓</span>
            {point}
          </li>
        ))}
      </ul>

      <div className="upgrade-trust__guarantee">
        <h3>{bugFixGuarantee.title}</h3>
        <p>{bugFixGuarantee.message}</p>
        <p className="upgrade-trust__guarantee-note">{bugFixGuarantee.note}</p>
      </div>
    </section>
  );
}
