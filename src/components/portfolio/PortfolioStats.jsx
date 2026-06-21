import { portfolioStats } from '../../data/featuredProjects';
import './Portfolio.css';

export default function PortfolioStats() {
  return (
    <div className="portfolio-stats">
      {portfolioStats.map((stat) => (
        <article key={stat.id} className="portfolio-stats__item">
          <p className="portfolio-stats__value">{stat.value}</p>
          <h3 className="portfolio-stats__label">{stat.label}</h3>
          <p className="portfolio-stats__desc">{stat.description}</p>
        </article>
      ))}
    </div>
  );
}
