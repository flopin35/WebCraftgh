import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import UpgradeTrustSection from '../../components/upgrades/UpgradeTrustSection';
import WebsiteUpgrades from '../../components/upgrades/WebsiteUpgrades';
import ConfirmationModal from '../../components/request/ConfirmationModal';
import DeploymentCard from '../../components/request/DeploymentCard';
import RequestForm, { initialFormData } from '../../components/request/RequestForm';
import RequestHeader from '../../components/request/RequestHeader';
import RequestPricing from '../../components/request/RequestPricing';
import RequestSummary from '../../components/request/RequestSummary';
import { getBundleById } from '../../data/upgrades';
import { createRequest, validateRequest } from '../../services/requestService';
import { getSelectedTemplate, getTemplateById } from '../../services/templateService';
import { calculatePricing } from '../../utils/pricing';
import './Request.css';

export default function Request() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedUpgradeIds, setSelectedUpgradeIds] = useState([]);
  const [selectedBundleId, setSelectedBundleId] = useState(null);
  const [includeDeployment, setIncludeDeployment] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const selection = getSelectedTemplate();

    if (!selection?.id) {
      navigate('/', { replace: true });
      return;
    }

    const fullTemplate = getTemplateById(selection.id);

    if (!fullTemplate) {
      navigate('/', { replace: true });
      return;
    }

    setTemplate(fullTemplate);
  }, [navigate]);

  const pricing = useMemo(
    () =>
      calculatePricing({
        templatePrice: template?.price ?? 0,
        selectedUpgradeIds,
        selectedBundleId,
        includeDeployment,
      }),
    [template?.price, selectedUpgradeIds, selectedBundleId, includeDeployment]
  );

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFormError('');
  };

  const handleToggleUpgrade = (upgradeId) => {
    const bundle = selectedBundleId ? getBundleById(selectedBundleId) : null;
    if (bundle?.includes.includes(upgradeId)) return;

    setSelectedUpgradeIds((current) =>
      current.includes(upgradeId)
        ? current.filter((id) => id !== upgradeId)
        : [...current, upgradeId]
    );
  };

  const handleToggleBundle = (bundleId) => {
    setSelectedBundleId((current) => (current === bundleId ? null : bundleId));
  };

  const handleSubmitClick = () => {
    if (isSubmitting) return;

    const validation = validateRequest({ template, formData });

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
      const result = await createRequest({
        template,
        formData,
        selectedUpgradeIds,
        selectedBundleId,
        includeDeployment,
      });

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      setIsModalOpen(false);
      navigate('/receipt');
    } catch (error) {
      console.error('[Request] Unexpected submission error:', error);
      setSubmitError('Unable to submit request.\n\nPlease try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSubmitError('');
  };

  if (!template) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="request-page">
        <div className="container request-page__inner">
          <RequestHeader />

          <div className="request-page__layout">
            <div className="request-page__main">
              <RequestSummary />
              <WebsiteUpgrades
                selectedUpgradeIds={selectedUpgradeIds}
                selectedBundleId={selectedBundleId}
                onToggleUpgrade={handleToggleUpgrade}
                onToggleBundle={handleToggleBundle}
              />
              <DeploymentCard
                isSelected={includeDeployment}
                onToggle={() => setIncludeDeployment((current) => !current)}
              />
              <RequestForm formData={formData} onFieldChange={handleFieldChange} />
              <UpgradeTrustSection />

              {formError && (
                <p className="request-page__error" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="button"
                className="btn btn--primary btn--full request-page__submit"
                onClick={handleSubmitClick}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
              </button>

              <Link to="/" className="btn btn--outline request-page__back">
                Choose a Different Template
              </Link>
            </div>

            <div className="request-page__sidebar">
              <RequestPricing pricing={pricing} includeDeployment={includeDeployment} />
            </div>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        onCancel={handleModalCancel}
        onContinue={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </>
  );
}
