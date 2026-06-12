import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import TemplateCard from '../../components/TemplateCard/TemplateCard';
import Footer from '../../components/Footer/Footer';
import { getTemplates, getCustomWebsite } from '../../services/templateService';
import './Home.css';

export default function Home() {
  const templates = getTemplates();
  const customWebsite = getCustomWebsite();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    if (location.state?.unauthorized) {
      setShowUnauthorized(true);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  return (
    <>
      <Navbar />

      {showUnauthorized && (
        <div className="container">
          <div className="home-alert" role="alert">
            <strong>Unauthorized Access</strong>
            <p>You do not have permission to access the admin area.</p>
          </div>
        </div>
      )}

      <main>
        <Hero />

        <section id="templates" className="templates section">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">Choose Your Template</h2>
              <p className="section__subtitle">
                Professional designs ready to launch. Pick a template and we'll customize it for your
                brand.
              </p>
            </div>

            <div className="templates__grid">
              {templates.map((template) => (
                <TemplateCard key={template.id} {...template} />
              ))}
            </div>
          </div>
        </section>

        <section id="custom" className="custom section">
          <div className="container">
            <article className="custom-card">
              <div className="custom-card__content">
                <span className="custom-card__label">{customWebsite.label}</span>
                <h2 className="custom-card__title">{customWebsite.title}</h2>
                <p className="custom-card__description">{customWebsite.description}</p>
                <ul className="custom-card__features">
                  {customWebsite.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="custom-card__action">
                <p className="custom-card__price">{customWebsite.price}</p>
                <button type="button" className="btn btn--primary btn--lg">
                  Request Custom Website
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
