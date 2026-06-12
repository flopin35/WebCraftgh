const MAX_FIELD_LENGTHS = {
  fullName: 120,
  phone: 30,
  email: 120,
  businessName: 120,
  additionalNotes: 2000,
};

function trimToMax(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export function sanitizeFormData(formData = {}) {
  return {
    fullName: trimToMax(formData.fullName, MAX_FIELD_LENGTHS.fullName),
    phone: trimToMax(formData.phone, MAX_FIELD_LENGTHS.phone),
    email: trimToMax(formData.email, MAX_FIELD_LENGTHS.email),
    businessName: trimToMax(formData.businessName, MAX_FIELD_LENGTHS.businessName),
    additionalNotes: trimToMax(formData.additionalNotes, MAX_FIELD_LENGTHS.additionalNotes),
  };
}

export function sanitizeRequestInput(requestInput) {
  return {
    ...requestInput,
    formData: sanitizeFormData(requestInput.formData),
  };
}

export { MAX_FIELD_LENGTHS };
