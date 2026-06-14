import { useEffect, useState } from 'react';
import './request.css';

export default function ConfirmationModal({
  isOpen,
  onCancel,
  onContinue,
  isSubmitting = false,
  submitError = '',
  title = '⚠️ Final Confirmation',
  messages = [
    'This request will be saved and reviewed by our team.',
    'Once submitted, the review process cannot be cancelled or paused.',
    'You will be contacted once your review is complete and your final quotation is ready.',
  ],
  continueLabel = 'Continue',
  submittingLabel = 'Submitting Request...',
}) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="confirmation-modal"
      role="presentation"
      onClick={isSubmitting ? undefined : onCancel}
    >
      <div
        className="confirmation-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirmation-modal-title" className="confirmation-modal__title">
          {title.startsWith('⚠️') ? title : `⚠️ ${title}`}
        </h2>

        <div className="confirmation-modal__message">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
          <p className="confirmation-modal__question">Are you sure you want to continue?</p>
        </div>

        <label className={`confirmation-modal__checkbox${isConfirmed ? ' is-checked' : ''}`}>
          <input
            type="checkbox"
            checked={isConfirmed}
            disabled={isSubmitting}
            onChange={(event) => setIsConfirmed(event.target.checked)}
          />
          <span>I understand and wish to continue.</span>
        </label>

        {submitError && (
          <p className="confirmation-modal__error" role="alert">
            {submitError.split('\n').map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}

        <div className="confirmation-modal__actions">
          <button type="button" className="btn btn--outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!isConfirmed || isSubmitting}
            onClick={onContinue}
          >
            {isSubmitting ? submittingLabel : continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
