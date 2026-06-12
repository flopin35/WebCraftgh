import { useEffect, useState } from 'react';
import { getSelectedTemplate, getTemplateById } from '../../services/templateService';
import './request.css';

export default function RequestSummary() {
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const selection = getSelectedTemplate();
    if (!selection?.id) return;

    const fullTemplate = getTemplateById(selection.id);
    if (!fullTemplate) return;

    setTemplate({
      name: selection.name,
      price: selection.price,
      features: fullTemplate.features,
    });
  }, []);

  if (!template) return null;

  return (
    <section className="request-card request-summary" aria-labelledby="request-summary-title">
      <p className="request-card__label">Selected Template</p>
      <h2 id="request-summary-title" className="request-card__title">
        Template Summary
      </h2>

      <p className="request-summary__name">{template.name}</p>
      <p className="request-summary__price">
        <span>GHS</span> {template.price.toLocaleString()}
      </p>

      <h3 className="request-summary__features-title">Included Features</h3>
      <ul className="request-summary__features">
        {template.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </section>
  );
}
