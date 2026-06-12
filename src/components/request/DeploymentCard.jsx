import { deploymentService } from '../../data/upgrades';
import './request.css';

export default function DeploymentCard({ isSelected, onToggle }) {
  return (
    <section
      className={`request-card deployment-card${isSelected ? ' deployment-card--selected' : ''}`}
      aria-labelledby="deployment-card-title"
    >
      <p className="request-card__label">Deployment Service</p>
      <h2 id="deployment-card-title" className="deployment-card__title">
        {deploymentService.name}
      </h2>

      <p className="deployment-card__description">{deploymentService.description}</p>

      <ul className="deployment-card__includes">
        {deploymentService.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p className="deployment-card__price">
        + GHS {deploymentService.price.toLocaleString()}
      </p>

      <label className={`deployment-card__checkbox${isSelected ? ' is-checked' : ''}`}>
        <input type="checkbox" checked={isSelected} onChange={onToggle} />
        <span className="deployment-card__checkbox-label">Add Professional Deployment</span>
      </label>
    </section>
  );
}
