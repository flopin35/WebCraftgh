import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__badge">Trusted by businesses across Ghana</p>
          <h1 className="hero__headline">Get A Professional Website For Your Business</h1>
          <p className="hero__subheadline">
            Customize a website to suit your needs and your budget — from GH₵1,000. Pick your pages, colours
            and features, see a live preview, and get a clear estimate in minutes.
          </p>
          <div className="hero__actions">
            <Link to="/build" className="btn btn--primary btn--lg hero__cta">
              Build Your Website
            </Link>
            <Link to="/custom-estimate" className="btn btn--outline btn--lg">
              Get a Custom Estimate
            </Link>
          </div>
          <a href="#templates" className="hero__link">
            Or browse ready-made templates →
          </a>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__mockup">
            <div className="hero__mockup-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="hero__mockup-body">
              <div className="hero__mockup-block hero__mockup-block--wide"></div>
              <div className="hero__mockup-row">
                <div className="hero__mockup-block"></div>
                <div className="hero__mockup-block"></div>
                <div className="hero__mockup-block"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
