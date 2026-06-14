import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import CustomRequestHeader from '../../components/custom/CustomRequestHeader';
import CustomWebsiteForm, {
  initialCustomFormData,
} from '../../components/custom/CustomWebsiteForm';
import ConfirmationModal from '../../components/request/ConfirmationModal';
import {
  createCustomWebsiteRequest,
  validateCustomRequest,
} from '../../services/customWebsiteService';
import '../../components/custom/CustomRequest.css';
import '../../components/request/request.css';

const CUSTOM_CONFIRMATION_MESSAGES = [
  'This request will be reviewed by our team.',
  'Once submitted, the review process cannot be cancelled or paused.',
  'You will be contacted after review with your final quotation.',
];

export default function CustomRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialCustomFormData);
  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [uploads, setUploads] = useState({ logo: [], reference: [], document: [] });
  const [formError, setFormError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFormError('');
  };

  const handleTogglePage = (pageId) => {
    setSelectedPages((current) =>
      current.includes(pageId) ? current.filter((id) => id !== pageId) : [...current, pageId]
    );
  };

  const handleToggleFeature = (featureId) => {
    setSelectedFeatures((current) =>
      current.includes(featureId)
        ? current.filter((id) => id !== featureId)
        : [...current, featureId]
    );
  };

  const handleUploadChange = (category, files) => {
    setUploads((current) => ({ ...current, [category]: files }));
  };

  const handleUploadRemove = (category, index) => {
    setUploads((current) => ({
      ...current,
      [category]: current[category].filter((_, fileIndex) => fileIndex !== index),
    }));
  };

  const buildUploadPayload = () =>
    Object.entries(uploads)
      .filter(([, files]) => files.length > 0)
      .map(([category, files]) => ({ category, files }));

  const handleSubmitClick = () => {
    if (isSubmitting) return;

    const validation = validateCustomRequest({ formData, selectedPages, selectedFeatures });

    if (!validation.isValid) {
      setFormError(validation.errors.join(' '));
      return;
    }

    setFormError('');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await createCustomWebsiteRequest({
        formData,
        selectedPages,
        selectedFeatures,
        uploads: buildUploadPayload(),
      });

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      setIsModalOpen(false);
      navigate('/custom-receipt');
    } catch (error) {
      console.error('[CustomRequest] Unexpected submission error:', error);
      setSubmitError('Unable to submit custom request.\n\nPlease try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="custom-request-page">
        <div className="container custom-request-page__inner">
          <CustomRequestHeader />

          <CustomWebsiteForm
            formData={formData}
            selectedPages={selectedPages}
            selectedFeatures={selectedFeatures}
            uploads={uploads}
            onFieldChange={handleFieldChange}
            onTogglePage={handleTogglePage}
            onToggleFeature={handleToggleFeature}
            onUploadChange={handleUploadChange}
            onUploadRemove={handleUploadRemove}
          />

          {formError && (
            <p className="custom-request-page__error" role="alert">
              {formError}
            </p>
          )}

          <button
            type="button"
            className="btn btn--primary btn--full custom-request-page__submit"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Custom Request...' : 'Submit Custom Request'}
          </button>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        onCancel={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
            setSubmitError('');
          }
        }}
        onContinue={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        title="Final Confirmation"
        messages={CUSTOM_CONFIRMATION_MESSAGES}
        continueLabel="Submit Custom Request"
        submittingLabel="Submitting Custom Request..."
      />
    </>
  );
}
