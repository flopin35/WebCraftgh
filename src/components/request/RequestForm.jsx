import { MAX_FIELD_LENGTHS } from '../../utils/inputSanitizer';
import './request.css';

const initialFormData = {
  fullName: '',
  phone: '',
  email: '',
  businessName: '',
  additionalNotes: '',
};

export { initialFormData };

export default function RequestForm({ formData, onFieldChange }) {
  return (
    <section className="request-card request-form" aria-labelledby="request-form-title">
      <p className="request-card__label">Your Details</p>
      <h2 id="request-form-title" className="request-card__title">
        Contact Information
      </h2>

      <div className="request-form__grid request-form__grid--two">
        <div className="request-form__field">
          <label className="request-form__label" htmlFor="fullName">
            Full Name <span className="request-form__required">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="request-form__input"
            placeholder="John Mensah"
            value={formData.fullName}
            onChange={onFieldChange}
            maxLength={MAX_FIELD_LENGTHS.fullName}
            required
          />
        </div>

        <div className="request-form__field">
          <label className="request-form__label" htmlFor="phone">
            Phone Number <span className="request-form__required">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="request-form__input"
            placeholder="0501234567"
            value={formData.phone}
            onChange={onFieldChange}
            maxLength={MAX_FIELD_LENGTHS.phone}
            required
          />
        </div>

        <div className="request-form__field">
          <label className="request-form__label" htmlFor="email">
            Email <span className="request-form__required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="request-form__input"
            placeholder="you@business.com"
            value={formData.email}
            onChange={onFieldChange}
            maxLength={MAX_FIELD_LENGTHS.email}
            required
          />
        </div>

        <div className="request-form__field">
          <label className="request-form__label" htmlFor="businessName">
            Business Name <span className="request-form__required">*</span>
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            className="request-form__input"
            placeholder="Your Business Ltd"
            value={formData.businessName}
            onChange={onFieldChange}
            maxLength={MAX_FIELD_LENGTHS.businessName}
            required
          />
        </div>

        <div className="request-form__field request-form__field--full">
          <label className="request-form__label" htmlFor="additionalNotes">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            className="request-form__textarea"
            placeholder="Share any specific requirements, pages, or ideas for your website..."
            value={formData.additionalNotes}
            onChange={onFieldChange}
            maxLength={MAX_FIELD_LENGTHS.additionalNotes}
          />
        </div>
      </div>
    </section>
  );
}
