import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../request/ConfirmationModal';
import { createCustomWebsiteRequest, validateWizardStep } from '../../../services/customWebsiteService';
import { useCustomWizardDraft } from '../../../hooks/useCustomWizardDraft';
import WizardNavigation from './WizardNavigation';
import WizardProgress from './WizardProgress';
import StepBudgetTimeline from './steps/StepBudgetTimeline';
import StepBusinessInfo from './steps/StepBusinessInfo';
import StepFeatures from './steps/StepFeatures';
import StepProjectDetails from './steps/StepProjectDetails';
import StepReview from './steps/StepReview';
import StepWebsiteGoals from './steps/StepWebsiteGoals';
import './CustomWizard.css';

const CONFIRMATION_MESSAGES = [
  'Your request will be reviewed by our team.',
  'We will contact you with a tailored quotation — usually within 1–2 business days.',
  'No payment is required to submit this request.',
];

export default function CustomRequestWizard() {
  const navigate = useNavigate();
  const {
    state,
    uploads,
    setUploads,
    updateFormData,
    toggleGoal,
    toggleFeature,
    updateProjectDetails,
    setBudget,
    setTimeline,
    goToStep,
    clearDraft,
  } = useCustomWizardDraft();

  const [stepError, setStepError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateCurrentStep = () => {
    const result = validateWizardStep(state);
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
    setStepError('');
    if (state.step > 1) goToStep(state.step - 1);
  };

  const handleConfirmSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await createCustomWebsiteRequest({
        formData: state.formData,
        websiteGoals: state.websiteGoals,
        selectedFeatures: state.selectedFeatures,
        projectDetails: state.projectDetails,
        budget: state.budget,
        timeline: state.timeline,
        uploads: buildUploadPayload(),
      });

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      clearDraft();
      setIsModalOpen(false);
      navigate('/custom-receipt');
    } catch {
      setSubmitError('Unable to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="custom-wizard">
      <WizardProgress currentStep={state.step} />

      <div className="custom-wizard__body">
        {state.step === 1 && (
          <StepBusinessInfo formData={state.formData} onChange={updateFormData} error={stepError} />
        )}
        {state.step === 2 && (
          <StepWebsiteGoals
            selectedGoals={state.websiteGoals}
            onToggle={toggleGoal}
            error={stepError}
          />
        )}
        {state.step === 3 && (
          <StepFeatures selectedFeatures={state.selectedFeatures} onToggle={toggleFeature} />
        )}
        {state.step === 4 && (
          <StepProjectDetails
            projectDetails={state.projectDetails}
            onChange={updateProjectDetails}
            uploads={uploads}
            onUploadChange={handleUploadChange}
            onUploadRemove={handleUploadRemove}
            error={stepError}
          />
        )}
        {state.step === 5 && (
          <StepBudgetTimeline
            budget={state.budget}
            timeline={state.timeline}
            onBudgetChange={setBudget}
            onTimelineChange={setTimeline}
            error={stepError}
          />
        )}
        {state.step === 6 && <StepReview state={state} />}
      </div>

      <p className="custom-wizard__autosave">Progress saved automatically on this device.</p>

      <WizardNavigation
        showBack={state.step > 1}
        onBack={handleBack}
        onNext={handleNext}
        nextLabel={state.step === 6 ? 'Submit Request' : 'Continue'}
        isSubmitting={isSubmitting}
      />

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
        title="Submit your website request?"
        messages={CONFIRMATION_MESSAGES}
        continueLabel="Submit Request"
        submittingLabel="Submitting..."
      />
    </div>
  );
}
