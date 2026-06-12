import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__badge">Trusted by businesses across Ghana</p>
          <h1 className="hero__headline">Get A Professional Website For Your Business</h1>
          <p className="hero__subheadline">
            Choose a ready-made template or request a custom website. We build it, you focus on your
            business.
          </p>
          <a href="#templates" className="btn btn--primary">
            View Templates
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
