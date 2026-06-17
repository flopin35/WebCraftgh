import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmationModal from '../../request/ConfirmationModal';
import WizardNavigation from '../../custom/wizard/WizardNavigation';
import { getPackageById, getWebsiteTypeById } from '../../../data/templateCatalog';
import { useTemplateWizardDraft } from '../../../hooks/useTemplateWizardDraft';
import {
  createRequest,
  validateTemplateWizardStep,
} from '../../../services/requestService';
import { calculatePricing } from '../../../utils/pricing';
import TemplateWizardProgress from './TemplateWizardProgress';
import StepContact from './steps/StepContact';
import StepFeatureCategories from './steps/StepFeatureCategories';
import StepRecommendation from './steps/StepRecommendation';
import StepReview from './steps/StepReview';
import StepSelectPackage from './steps/StepSelectPackage';
import StepWebsiteType from './steps/StepWebsiteType';
import '../../custom/wizard/CustomWizard.css';
import './TemplateWizard.css';

const CONFIRMATION_MESSAGES = [
  'Your request will be reviewed by our team.',
  'We will contact you within 24–48 hours to confirm details.',
  'No payment is required to submit this request.',
];

export default function TemplateRequestWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    state,
    setWebsiteType,
    setPackageId,
    toggleUpgrade,
    applyBundle,
    dismissRecommendation,
    updateFormData,
    goToStep,
    clearDraft,
  } = useTemplateWizardDraft();

  const [stepError, setStepError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && getWebsiteTypeById(typeParam) && !state.websiteTypeId) {
      setWebsiteType(typeParam);
    }
  }, [searchParams, setWebsiteType, state.websiteTypeId]);

  const template = useMemo(
    () => (state.packageId ? getPackageById(state.packageId) : null),
    [state.packageId]
  );

  const pricing = useMemo(
    () =>
      calculatePricing({
        templatePrice: template?.price ?? 0,
        selectedUpgradeIds: state.selectedUpgradeIds,
        selectedBundleId: state.selectedBundleId,
        includeDeployment: false,
      }),
    [template?.price, state.selectedUpgradeIds, state.selectedBundleId]
  );

  const validateCurrentStep = () => {
    const result = validateTemplateWizardStep(state);
    if (!result.isValid) {
      setStepError(result.errors.join(' '));
      return false;
    }
    setStepError('');
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (state.step < 6) {
      goToStep(state.step + 1);
      return;
    }

    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleBack = () => {
    if (state.step > 1) {
      setStepError('');
      goToStep(state.step - 1);
    }
  };

  const handleConfirmSubmit = async () => {
    if (isSubmitting || !template) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await createRequest({
        template,
        formData: state.formData,
        selectedUpgradeIds: state.selectedUpgradeIds,
        selectedBundleId: state.selectedBundleId,
        includeDeployment: false,
        websiteTypeId: state.websiteTypeId,
      });

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      clearDraft();
      setIsModalOpen(false);
      navigate('/receipt');
    } catch (error) {
      console.error('[TemplateRequestWizard] Unexpected submission error:', error);
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

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <StepWebsiteType
            websiteTypeId={state.websiteTypeId}
            onSelect={setWebsiteType}
            error={stepError}
          />
        );
      case 2:
        return (
          <StepSelectPackage
            websiteTypeId={state.websiteTypeId}
            packageId={state.packageId}
            onSelect={setPackageId}
            error={stepError}
          />
        );
      case 3:
        return (
          <StepFeatureCategories
            websiteTypeId={state.websiteTypeId}
            selectedUpgradeIds={state.selectedUpgradeIds}
            selectedBundleId={state.selectedBundleId}
            onToggle={toggleUpgrade}
          />
        );
      case 4:
        return (
          <StepRecommendation
            websiteTypeId={state.websiteTypeId}
            selectedUpgradeIds={state.selectedUpgradeIds}
            selectedBundleId={state.selectedBundleId}
            onApplyBundle={applyBundle}
            onSkip={dismissRecommendation}
          />
        );
      case 5:
        return (
          <StepContact formData={state.formData} onChange={updateFormData} error={stepError} />
        );
      case 6:
        return (
          <StepReview
            websiteTypeId={state.websiteTypeId}
            template={template}
            selectedUpgradeIds={state.selectedUpgradeIds}
            selectedBundleId={state.selectedBundleId}
            pricing={pricing}
            formData={state.formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="template-wizard">
        <div className="template-wizard__intro">
          <h1>Get Your Website</h1>
          <p>Answer a few simple questions and we&apos;ll prepare your package quote.</p>
        </div>

        <TemplateWizardProgress currentStep={state.step} />

        <div className="template-wizard__body">{renderStep()}</div>

        <WizardNavigation
          onBack={handleBack}
          onNext={handleNext}
          showBack={state.step > 1}
          nextLabel={state.step === 6 ? 'Submit Request' : 'Continue'}
          isSubmitting={isSubmitting}
        />

        <p className="template-wizard__autosave">Your progress is saved automatically.</p>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onCancel={handleModalCancel}
        onContinue={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        messages={CONFIRMATION_MESSAGES}
      />
    </>
  );
}
