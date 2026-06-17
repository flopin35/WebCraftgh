import { useState } from 'react';
import { getUpgradeById, getBundleById } from '../../../../data/upgrades';
import {
  friendlyUpgradeCopy,
  getCategoriesForWebsiteType,
} from '../../../../data/templateCatalog';

export default function StepFeatureCategories({
  websiteTypeId,
  selectedUpgradeIds,
  selectedBundleId,
  onToggle,
}) {
  const categories = getCategoriesForWebsiteType(websiteTypeId);
  const [openCategories, setOpenCategories] = useState(() =>
    categories.length ? [categories[0].id] : []
  );

  const toggleCategory = (categoryId) => {
    setOpenCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const bundleIncludes = selectedBundleId ? getBundleById(selectedBundleId)?.includes ?? [] : [];

  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">Add features that matter to you</h2>
        <p className="wizard-step__subtitle">
          Optional — expand a category and pick only what you need. No technical jargon.
        </p>
      </header>

      {categories.map((category) => {
        const isOpen = openCategories.includes(category.id);

        return (
          <div key={category.id} className={`feature-category${isOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="feature-category__toggle"
              onClick={() => toggleCategory(category.id)}
              aria-expanded={isOpen}
            >
              <span>
                <span className="feature-category__title">{category.label}</span>
                <span className="feature-category__desc">{category.description}</span>
              </span>
              <span className="feature-category__chevron" aria-hidden="true">
                ▾
              </span>
            </button>

            <div className="feature-category__body">
              {category.featureIds.map((featureId) => {
                const upgrade = getUpgradeById(featureId);
                const friendly = friendlyUpgradeCopy[featureId];
                if (!upgrade) return null;

                const isInBundle = bundleIncludes.includes(featureId);
                const isSelected = selectedUpgradeIds.includes(featureId) || isInBundle;

                return (
                  <button
                    key={featureId}
                    type="button"
                    className={`wizard-card wizard-card--feature${isSelected ? ' is-selected' : ''}${
                      isInBundle ? ' is-included' : ''
                    }`}
                    onClick={() => !isInBundle && onToggle(featureId)}
                    disabled={isInBundle}
                    aria-pressed={isSelected}
                  >
                    <span className="wizard-card__check" aria-hidden="true">
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="wizard-card__content">
                      <span className="wizard-card__title">
                        {friendly?.name ?? upgrade.name}
                        <span className="wizard-card__price"> +GHS {upgrade.price}</span>
                      </span>
                      <span className="wizard-card__desc">
                        {friendly?.description ?? upgrade.description}
                      </span>
                      {isInBundle && (
                        <span className="wizard-card__desc">Included in your selected bundle.</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
