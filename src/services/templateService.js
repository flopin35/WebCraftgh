import { getPackageById, templatePackages, websiteTypes } from '../data/templateCatalog';
import { customWebsite } from '../data/templates';
import { getFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

export function getWebsiteTypes() {
  return websiteTypes;
}

export function getTemplatePackages() {
  return templatePackages;
}

export function getTemplates() {
  return websiteTypes;
}

export function getTemplateById(id) {
  return getPackageById(id);
}

export function getCustomWebsite() {
  return customWebsite;
}

export function saveSelectedTemplate(template) {
  const selection = {
    id: template.id,
    name: template.name,
    price: template.price,
  };

  saveToStorage(STORAGE_KEYS.SELECTED_TEMPLATE, selection);
  return selection;
}

export function getSelectedTemplate() {
  return getFromStorage(STORAGE_KEYS.SELECTED_TEMPLATE);
}

export function clearSelectedTemplate() {
  removeFromStorage(STORAGE_KEYS.SELECTED_TEMPLATE);
}
