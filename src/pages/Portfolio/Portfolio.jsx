import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import FeaturedProjects from '../../components/portfolio/FeaturedProjects';
import './Portfolio.css';

export default function Portfolio() {
  return (
    <>
      <Navbar />

      <main>
        <section className="portfolio-page-hero">
          <div className="container portfolio-page-hero__inner">
            <span className="portfolio-page-hero__eyebrow">WebCraft Ghana Portfolio</span>
            <h1 className="portfolio-page-hero__title">Websites That Work For Real Businesses</h1>
            <p className="portfolio-page-hero__subtitle">
              Explore live projects we&apos;ve delivered for security firms, campaigns, and
              organizations across Ghana — proof of what we can build for you.
            </p>
          </div>
        </section>

        <FeaturedProjects id="featured" showViewAll={false} />

        <section className="portfolio-page-bottom section">
          <div className="container portfolio-page-bottom__inner">
            <h2 className="portfolio-page-bottom__title">Let&apos;s Build Yours Next</h2>
            <p className="portfolio-page-bottom__text">
              Join Ghanaian businesses that trust WebCraft for professional, conversion-focused
              websites.
            </p>
            <Link to="/request" className="btn btn--primary btn--lg">
              Get Started Today
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
