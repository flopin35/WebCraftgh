import { Link } from 'react-router-dom';
import { SITE_DOMAIN, SITE_NAME, SITE_TAGLINE, SITE_URL } from '../../constants/site';
import './Footer.css';

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#2563EB" />
      <path
        d="M7 18L11 10L14 16L17 12L21 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="logo logo--footer">
            <span className="logo__icon" aria-hidden="true">
              <LogoIcon />
            </span>
            <span className="logo__text">{SITE_NAME}</span>
          </Link>
          <p className="footer__tagline">{SITE_TAGLINE}</p>
          <a href={SITE_URL} className="footer__domain">
            {SITE_DOMAIN}
          </a>
        </div>
        <div className="footer__contact">
          <h3 className="footer__heading">Quick Links</h3>
          <ul className="footer__links">
            <li>
              <Link to="/portfolio" className="footer__link">
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/request" className="footer__link">
                Get a Website
              </Link>
            </li>
            <li>
              <Link to="/custom-request" className="footer__link">
                Custom Website
              </Link>
            </li>
          </ul>
        </div>
        <div className="footer__contact">
          <h3 className="footer__heading">Contact Us</h3>
          <ul className="footer__links">
            <li>
              <a href="tel:0509002402" className="footer__link">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                0509002402
              </a>
            </li>
            <li>
              <a href="mailto:campaignhubgh@gmail.com" className="footer__link">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                campaignhubgh@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <p>
            &copy; 2026 {SITE_NAME}. All rights reserved. ·{' '}
            <a href={SITE_URL}>{SITE_DOMAIN}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
