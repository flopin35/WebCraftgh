import './request.css';

export default function RequestHeader() {
  return (
    <header className="request-header">
      <p className="request-header__trust">
        <span aria-hidden="true">✓</span>
        Secure &amp; professional — your details stay private
      </p>
      <h1 className="request-header__title">Request Your Website</h1>
      <p className="request-header__subtitle">
        Tell us about your business and choose any optional features. We&apos;ll review your
        requirements and get back to you with a clear plan.
      </p>
    </header>
  );
}
