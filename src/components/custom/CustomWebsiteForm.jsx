import CustomUploadSection from './CustomUploadSection';
import {
  businessTypes,
  CUSTOM_ESTIMATED_PRICE,
  featureOptions,
  pageOptions,
} from '../../data/customWebsiteOptions';
import './CustomRequest.css';
import '../../components/request/request.css';

export const initialCustomFormData = {
  fullName: '',
  phone: '',
  email: '',
  businessName: '',
  businessType: '',
  websiteName: '',
  websitePurpose: '',
  projectDescription: '',
};

export default function CustomWebsiteForm({
  formData,
  selectedPages,
  selectedFeatures,
  uploads,
  onFieldChange,
  onTogglePage,
  onToggleFeature,
  onUploadChange,
  onUploadRemove,
}) {
  return (
    <div className="custom-request-form">
      <section className="request-card custom-section">
        <h2 className="request-card__title">Your Information</h2>
        <div className="custom-request-form__grid custom-request-form__grid--two">
          <div className="request-form__field">
            <label className="request-form__label" htmlFor="customFullName">
              Full Name <span className="request-form__required">*</span>
            </label>
            <input
              id="customFullName"
              name="fullName"
              type="text"
              className="request-form__input"
              value={formData.fullName}
              onChange={onFieldChange}
              required
            />
          </div>
          <div className="request-form__field">
            <label className="request-form__label" htmlFor="customPhone">
              Phone Number <span className="request-form__required">*</span>
            </label>
            <input
              id="customPhone"
              name="phone"
              type="tel"
              className="request-form__input"
              value={formData.phone}
              onChange={onFieldChange}
              required
            />
          </div>
          <div className="request-form__field">
            <label className="request-form__label" htmlFor="customEmail">
              Email Address <span className="request-form__required">*</span>
            </label>
            <input
              id="customEmail"
              name="email"
              type="email"
              className="request-form__input"
              value={formData.email}
              onChange={onFieldChange}
              required
            />
          </div>
          <div className="request-form__field">
            <label className="request-form__label" htmlFor="customBusinessName">
              Business / Organization Name <span className="request-form__required">*</span>
            </label>
            <input
              id="customBusinessName"
              name="businessName"
              type="text"
              className="request-form__input"
              value={formData.businessName}
              onChange={onFieldChange}
              required
            />
          </div>
          <div className="request-form__field custom-request-form__field--full">
            <label className="request-form__label" htmlFor="customBusinessType">
              Business Type <span className="request-form__required">*</span>
            </label>
            <select
              id="customBusinessType"
              name="businessType"
              className="request-form__input"
              value={formData.businessType}
              onChange={onFieldChange}
              required
            >
              <option value="">Select business type</option>
              {businessTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="request-card custom-section">
        <h2 className="request-card__title">Project Details</h2>
        <div className="custom-request-form__grid">
          <div className="request-form__field">
            <label className="request-form__label" htmlFor="websiteName">
              Website Name <span className="request-form__required">*</span>
            </label>
            <input
              id="websiteName"
              name="websiteName"
              type="text"
              className="request-form__input"
              value={formData.websiteName}
              onChange={onFieldChange}
              required
            />
          </div>
          <div className="request-form__field">
            <label className="request-form__label" htmlFor="websitePurpose">
              Website Purpose <span className="request-form__required">*</span>
            </label>
            <input
              id="websitePurpose"
              name="websitePurpose"
              type="text"
              className="request-form__input"
              placeholder="e.g. Job platform, church outreach, online store"
              value={formData.websitePurpose}
              onChange={onFieldChange}
              required
            />
          </div>
          <div className="request-form__field custom-request-form__field--full">
            <label className="request-form__label" htmlFor="projectDescription">
              Describe your website idea in detail <span className="request-form__required">*</span>
            </label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              className="request-form__textarea custom-request-form__textarea"
              placeholder={'Example: "I want a job platform where employers can post jobs and job seekers can apply."'}
              value={formData.projectDescription}
              onChange={onFieldChange}
              required
            />
          </div>
        </div>
      </section>

      <section className="request-card custom-section">
        <h2 className="request-card__title">Pages Needed</h2>
        <div className="custom-checkbox-grid">
          {pageOptions.map((page) => (
            <label key={page.id} className="custom-checkbox-item">
              <input
                type="checkbox"
                checked={selectedPages.includes(page.id)}
                onChange={() => onTogglePage(page.id)}
              />
              <span>{page.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="request-card custom-section">
        <h2 className="request-card__title">Features Needed</h2>
        <div className="custom-checkbox-grid">
          {featureOptions.map((feature) => (
            <label key={feature.id} className="custom-checkbox-item">
              <input
                type="checkbox"
                checked={selectedFeatures.includes(feature.id)}
                onChange={() => onToggleFeature(feature.id)}
              />
              <span>{feature.label}</span>
            </label>
          ))}
        </div>
      </section>

      <CustomUploadSection
        uploads={uploads}
        onUploadChange={onUploadChange}
        onRemoveFile={onUploadRemove}
      />

      <aside className="request-card custom-pricing-card">
        <h2 className="request-card__title">Pricing</h2>
        <p className="custom-pricing-card__text">
          Custom websites are reviewed individually. Final pricing will be determined after project
          review.
        </p>
        <p className="custom-pricing-card__range">Estimated range: {CUSTOM_ESTIMATED_PRICE}</p>
      </aside>
    </div>
  );
}
