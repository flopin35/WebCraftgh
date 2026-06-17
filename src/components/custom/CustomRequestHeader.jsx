import { Link } from 'react-router-dom';
import './CustomRequest.css';

export default function CustomRequestHeader() {
  return (
    <header className="custom-request-header">
      <p className="custom-request-header__label">Premium Service</p>
      <h1 className="custom-request-header__title">Custom Website Request</h1>
      <p className="custom-request-header__subtitle">
        Answer a few simple questions — no technical jargon. Takes about 3 minutes. We'll prepare
        your quote and call you with next steps.
      </p>
      <Link to="/#custom" className="custom-request-header__back">
        ← Back to templates
      </Link>
    </header>
  );
}
