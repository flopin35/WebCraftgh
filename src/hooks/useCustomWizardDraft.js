import { useCallback, useEffect, useState } from 'react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

export const initialWizardState = {
  step: 1,
  formData: {
    fullName: '',
    phone: '',
    email: '',
    businessName: '',
    businessType: '',
  },
  websiteGoals: [],
  selectedFeatures: [],
  projectDetails: {
    hasLogo: '',
    hasContent: '',
    hasDomain: '',
    hasExamples: '',
    exampleNotes: '',
    description: '',
  },
  budget: '',
  timeline: '',
};

function mergeDraft(saved) {
  if (!saved || typeof saved !== 'object') return initialWizardState;

  return {
    step: saved.step || 1,
    formData: { ...initialWizardState.formData, ...saved.formData },
    websiteGoals: Array.isArray(saved.websiteGoals) ? saved.websiteGoals : [],
    selectedFeatures: Array.isArray(saved.selectedFeatures) ? saved.selectedFeatures : [],
    projectDetails: { ...initialWizardState.projectDetails, ...saved.projectDetails },
    budget: saved.budget || '',
    timeline: saved.timeline || '',
  };
}

export function useCustomWizardDraft() {
  const [state, setState] = useState(() => mergeDraft(getFromStorage(STORAGE_KEYS.CUSTOM_WIZARD_DRAFT)));
  const [uploads, setUploads] = useState({ logo: [], reference: [] });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOM_WIZARD_DRAFT, state);
  }, [state]);

  const updateFormData = useCallback((patch) => {
    setState((current) => ({
      ...current,
      formData: { ...current.formData, ...patch },
    }));
  }, []);

  const toggleGoal = useCallback((goalId) => {
    setState((current) => ({
      ...current,
      websiteGoals: current.websiteGoals.includes(goalId)
        ? current.websiteGoals.filter((id) => id !== goalId)
        : [...current.websiteGoals, goalId],
    }));
  }, []);

  const toggleFeature = useCallback((featureId) => {
    setState((current) => ({
      ...current,
      selectedFeatures: current.selectedFeatures.includes(featureId)
        ? current.selectedFeatures.filter((id) => id !== featureId)
        : [...current.selectedFeatures, featureId],
    }));
  }, []);

  const updateProjectDetails = useCallback((patch) => {
    setState((current) => ({
      ...current,
      projectDetails: { ...current.projectDetails, ...patch },
    }));
  }, []);

  const setBudget = useCallback((budget) => {
    setState((current) => ({ ...current, budget }));
  }, []);

  const setTimeline = useCallback((timeline) => {
    setState((current) => ({ ...current, timeline }));
  }, []);

  const goToStep = useCallback((step) => {
    setState((current) => ({ ...current, step }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearDraft = useCallback(() => {
    setState(initialWizardState);
    setUploads({ logo: [], reference: [] });
    saveToStorage(STORAGE_KEYS.CUSTOM_WIZARD_DRAFT, initialWizardState);
  }, []);

  return {
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
  };
}
