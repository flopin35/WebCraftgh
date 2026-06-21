import { Link } from 'react-router-dom';
import { featuredProjects } from '../../data/featuredProjects';
import PortfolioStats from './PortfolioStats';
import PortfolioTrust from './PortfolioTrust';
import ProjectCard from './ProjectCard';
import './Portfolio.css';

export default function FeaturedProjects({ showViewAll = false, id = 'portfolio' }) {
  const projects = featuredProjects.filter((p) => p.featured);

  return (
    <section id={id} className="featured-projects section">
      <div className="container">
        <div className="featured-projects__intro">
          <span className="featured-projects__eyebrow">Our Work</span>
          <h2 className="section__title">Featured Projects</h2>
          <p className="section__subtitle">
            Real websites we&apos;ve built for Ghanaian businesses, campaigns, and organizations.
          </p>
        </div>

        <PortfolioStats />
        <PortfolioTrust />

        <div className="featured-projects__grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {showViewAll && (
          <div className="featured-projects__footer">
            <Link to="/portfolio" className="btn btn--outline btn--lg">
              View Full Portfolio
            </Link>
          </div>
        )}

        <div className="featured-projects__cta">
          <p className="featured-projects__cta-text">
            Ready to join our portfolio of successful Ghanaian businesses?
          </p>
          <div className="featured-projects__cta-actions">
            <Link to="/request" className="btn btn--primary btn--lg">
              Start Your Project
            </Link>
            <Link to="/custom-request" className="btn btn--outline btn--lg">
              Request Custom Website
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
