import {
  DEPLOYMENT_PRICE,
  getBundleById,
  getBundleIndividualTotal,
  getBundleSavings,
  getUpgradeById,
} from '../data/upgrades';

export function buildSelectedUpgradesList(selectedUpgradeIds, selectedBundleId) {
  const bundle = selectedBundleId ? getBundleById(selectedBundleId) : null;
  const bundleIncluded = bundle?.includes ?? [];
  const extraIds = selectedUpgradeIds.filter((id) => !bundleIncluded.includes(id));
  const allIds = bundle ? [...new Set([...bundleIncluded, ...extraIds])] : selectedUpgradeIds;

  return allIds
    .map((id) => getUpgradeById(id))
    .filter(Boolean)
    .map(({ id, name, price, description }) => ({ id, name, price, description }));
}

export function calculatePricing({
  templatePrice = 0,
  selectedUpgradeIds = [],
  selectedBundleId = null,
  includeDeployment = false,
}) {
  let upgradesSubtotal = 0;
  let bundleDiscount = 0;
  let bundleName = null;
  let bundlePrice = 0;

  const bundle = selectedBundleId ? getBundleById(selectedBundleId) : null;

  if (bundle) {
    bundleName = bundle.name;
    bundlePrice = bundle.price;
    bundleDiscount = getBundleSavings(bundle);
    upgradesSubtotal += bundle.price;

    const extraUpgrades = selectedUpgradeIds.filter((id) => !bundle.includes.includes(id));
    upgradesSubtotal += extraUpgrades.reduce(
      (total, id) => total + (getUpgradeById(id)?.price ?? 0),
      0
    );
  } else {
    upgradesSubtotal = selectedUpgradeIds.reduce(
      (total, id) => total + (getUpgradeById(id)?.price ?? 0),
      0
    );
  }

  const individualUpgradesTotal = bundle
    ? getBundleIndividualTotal(bundle) +
      selectedUpgradeIds
        .filter((id) => !bundle.includes.includes(id))
        .reduce((total, id) => total + (getUpgradeById(id)?.price ?? 0), 0)
    : upgradesSubtotal;

  const deploymentFee = includeDeployment ? DEPLOYMENT_PRICE : 0;
  const total = templatePrice + upgradesSubtotal + deploymentFee;

  return {
    templatePrice,
    upgradesSubtotal,
    individualUpgradesTotal,
    bundleDiscount,
    bundleName,
    bundlePrice,
    deploymentFee,
    total,
    selectedUpgradeIds,
    selectedBundleId,
  };
}

// Legacy signature support
export function calculateLegacyPricing(templatePrice, selectedFeatureIds, includeDeployment) {
  return calculatePricing({
    templatePrice,
    selectedUpgradeIds: selectedFeatureIds,
    selectedBundleId: null,
    includeDeployment,
  });
}
