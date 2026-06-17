import { useCallback, useEffect, useState } from 'react';
import { getBundleById } from '../data/upgrades';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

export const initialTemplateWizardState = {
  step: 1,
  websiteTypeId: '',
  packageId: '',
  selectedUpgradeIds: [],
  selectedBundleId: null,
  recommendationDismissed: false,
  formData: {
    fullName: '',
    phone: '',
    email: '',
    businessName: '',
    additionalNotes: '',
  },
};

function mergeDraft(saved) {
  if (!saved || typeof saved !== 'object') return initialTemplateWizardState;

  return {
    step: saved.step || 1,
    websiteTypeId: saved.websiteTypeId || '',
    packageId: saved.packageId || '',
    selectedUpgradeIds: Array.isArray(saved.selectedUpgradeIds) ? saved.selectedUpgradeIds : [],
    selectedBundleId: saved.selectedBundleId || null,
    recommendationDismissed: Boolean(saved.recommendationDismissed),
    formData: { ...initialTemplateWizardState.formData, ...saved.formData },
  };
}

export function useTemplateWizardDraft() {
  const [state, setState] = useState(() =>
    mergeDraft(getFromStorage(STORAGE_KEYS.TEMPLATE_WIZARD_DRAFT))
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TEMPLATE_WIZARD_DRAFT, state);
  }, [state]);

  const setWebsiteType = useCallback((websiteTypeId) => {
    setState((current) => ({
      ...current,
      websiteTypeId,
      packageId: '',
      selectedUpgradeIds: [],
      selectedBundleId: null,
      recommendationDismissed: false,
    }));
  }, []);

  const setPackageId = useCallback((packageId) => {
    setState((current) => ({ ...current, packageId }));
  }, []);

  const toggleUpgrade = useCallback((upgradeId) => {
    setState((current) => {
      const bundle = current.selectedBundleId;
      const bundleIncludes = bundle ? getBundleById(bundle)?.includes ?? [] : [];

      if (bundleIncludes.includes(upgradeId)) return current;

      return {
        ...current,
        selectedUpgradeIds: current.selectedUpgradeIds.includes(upgradeId)
          ? current.selectedUpgradeIds.filter((id) => id !== upgradeId)
          : [...current.selectedUpgradeIds, upgradeId],
        recommendationDismissed: false,
      };
    });
  }, []);

  const applyBundle = useCallback((bundleId) => {
    setState((current) => ({
      ...current,
      selectedBundleId: bundleId,
      recommendationDismissed: true,
    }));
  }, []);

  const dismissRecommendation = useCallback(() => {
    setState((current) => ({ ...current, recommendationDismissed: true }));
  }, []);

  const updateFormData = useCallback((patch) => {
    setState((current) => ({
      ...current,
      formData: { ...current.formData, ...patch },
    }));
  }, []);

  const goToStep = useCallback((step) => {
    setState((current) => ({ ...current, step }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearDraft = useCallback(() => {
    setState(initialTemplateWizardState);
    saveToStorage(STORAGE_KEYS.TEMPLATE_WIZARD_DRAFT, initialTemplateWizardState);
  }, []);

  return {
    state,
    setWebsiteType,
    setPackageId,
    toggleUpgrade,
    applyBundle,
    dismissRecommendation,
    updateFormData,
    goToStep,
    clearDraft,
  };
}
