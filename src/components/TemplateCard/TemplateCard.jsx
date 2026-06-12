import { useNavigate } from 'react-router-dom';
import { saveSelectedTemplate } from '../../services/templateService';
import './TemplateCard.css';

export default function TemplateCard({
  id,
  name,
  price,
  description,
  features,
  tag,
  tagVariant = 'default',
  featured = false,
}) {
  const navigate = useNavigate();
  const buttonClass = featured ? 'btn btn--primary btn--full' : 'btn btn--outline btn--full';
  const tagClass =
    tagVariant === 'blue' ? 'template-card__tag template-card__tag--blue' : 'template-card__tag';

  const handleSelect = () => {
    saveSelectedTemplate({ id, name, price });
    navigate('/request');
  };

  return (
    <article className={`template-card${featured ? ' template-card--featured' : ''}`}>
      <div className="template-card__header">
        {tag && <span className={tagClass}>{tag}</span>}
        <h3 className="template-card__title">{name}</h3>
        {description && <p className="template-card__description">{description}</p>}
        <p className="template-card__price">
          <span className="template-card__currency">GHS</span> {price.toLocaleString()}
        </p>
      </div>
      <ul className="template-card__features">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button type="button" className={buttonClass} onClick={handleSelect}>
        Select Template
      </button>
    </article>
  );
}
