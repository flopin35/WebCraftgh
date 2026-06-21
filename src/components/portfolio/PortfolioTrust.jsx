import { portfolioTrustMessages } from '../../data/featuredProjects';
import './Portfolio.css';

export default function PortfolioTrust() {
  return (
    <div className="portfolio-trust">
      {portfolioTrustMessages.map((item) => (
        <article key={item.id} className="portfolio-trust__item">
          <h3 className="portfolio-trust__headline">{item.headline}</h3>
          <p className="portfolio-trust__text">{item.text}</p>
        </article>
      ))}
    </div>
  );
}
