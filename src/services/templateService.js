import { templates, customWebsite } from '../data/templates';
import { getFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

export function getTemplates() {
  return templates;
}

export function getTemplateById(id) {
  return templates.find((template) => template.id === id) ?? null;
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
