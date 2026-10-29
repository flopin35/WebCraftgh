import { useCallback, useEffect, useRef, useState } from 'react';
import { BUILDER_DRAFT_VERSION, createInitialBuilderState } from '../data/builder/initialState';
import { getFromStorage, removeFromStorage, saveToStorage } from '../utils/storage';

const DRAFT_KEY = 'builderDraft';

function mergeDraft(saved) {
  const initial = createInitialBuilderState();
  if (!saved || typeof saved !== 'object' || saved.draftVersion !== BUILDER_DRAFT_VERSION) return initial;
  const merged = { ...initial, ...saved };
  for (const key of ['budget', 'branding', 'style', 'text', 'ecommerce', 'content', 'domain', 'customer']) {
    merged[key] = { ...initial[key], ...(saved[key] ?? {}) };
  }
  return merged;
}

export function hasSavedBuilderDraft() {
  const saved = getFromStorage(DRAFT_KEY, null);
  return Boolean(saved && saved.draftVersion === BUILDER_DRAFT_VERSION && (saved.type || saved.stepId !== 'budget'));
}

/** Builder state persisted to this device so customers can continue later. Files stay in memory only. */
export function useBuilderDraft() {
  const [state, setState] = useState(() => mergeDraft(getFromStorage(DRAFT_KEY, null)));
  const [uploads, setUploads] = useState({ logo: [], brand: [], documents: [] });
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (saveToStorage(DRAFT_KEY, state)) setSavedAt(new Date());
    }, 300);
    return () => clearTimeout(timer.current);
  }, [state]);

  const update = useCallback((patch) => {
    setState((current) => (typeof patch === 'function' ? patch(current) : { ...current, ...patch }));
  }, []);

  const updateSection = useCallback((section, patch) => {
    setState((current) => ({ ...current, [section]: { ...current[section], ...patch } }));
  }, []);

  const toggleIn = useCallback((key, id, section) => {
    setState((current) => {
      const list = section ? current[section][key] ?? [] : current[key] ?? [];
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      return section ? { ...current, [section]: { ...current[section], [key]: next } } : { ...current, [key]: next };
    });
  }, []);

  const reset = useCallback(() => {
    removeFromStorage(DRAFT_KEY);
    setState(createInitialBuilderState());
    setUploads({ logo: [], brand: [], documents: [] });
  }, []);

  return { state, update, updateSection, toggleIn, uploads, setUploads, reset, savedAt };
}
