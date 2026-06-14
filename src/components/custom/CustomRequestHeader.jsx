import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './CustomRequest.css';

export default function CustomRequestHeader() {
  return (
    <header className="custom-request-header">
      <p className="custom-request-header__label">Premium Service</p>
      <h1 className="custom-request-header__title">Custom Website Request</h1>
      <p className="custom-request-header__subtitle">
        Don't see a template that matches your needs? Tell us what you want and we'll create a custom
        website built specifically for your business or organization.
      </p>
      <Link to="/#custom" className="custom-request-header__back">
        ← Back to templates
      </Link>
    </header>
  );
}
