import { useState } from 'react';
import './Navbar.css';

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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <a href="#" className="logo" onClick={closeMenu}>
          <span className="logo__icon" aria-hidden="true">
            <LogoIcon />
          </span>
          <span className="logo__text">WebCraft GH</span>
        </a>

        <button
          type="button"
          className={`nav-toggle${isOpen ? ' is-active' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="nav-toggle__bar"></span>
          <span className="nav-toggle__bar"></span>
          <span className="nav-toggle__bar"></span>
        </button>

        <nav className={`nav${isOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <ul className="nav__list">
            <li>
              <a href="#templates" className="nav__link" onClick={closeMenu}>
                Templates
              </a>
            </li>
            <li>
              <a href="#custom" className="nav__link" onClick={closeMenu}>
                Custom Website
              </a>
            </li>
            <li>
              <a href="#contact" className="nav__link" onClick={closeMenu}>
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
