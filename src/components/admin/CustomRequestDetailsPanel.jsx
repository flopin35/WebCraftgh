import { useEffect, useState } from 'react';
import {
  budgetOptions,
  businessTypes,
  contentReadinessOptions,
  featureOptions,
  labelForOption,
  readinessOptions,
  timelineOptions,
  websiteGoalOptions,
} from '../../data/customWebsiteOptions';
import { REQUEST_STATUSES } from '../../constants/requestStatuses';
import { useAdminFileUrls } from '../../hooks/useAdminFileUrls';
import { formatDateTime } from '../../utils/formatters';
import LeadSummaryDetails from './LeadSummaryDetails';
import './admin.css';

function labelForId(options, id) {
  return options.find((item) => item.id === id)?.label ?? id;
}

function readinessLabel(value, options) {
  return labelForId(options, value) || value || '—';
}

export default function CustomRequestDetailsPanel({
  request,
  onClose,
  onAdminUpdate,
  isUpdating,
  updateError,
}) {
  const [selectedStatus, setSelectedStatus] = useState('Pending Review');
  const [adminNotes, setAdminNotes] = useState('');
  const [requestProgress, setRequestProgress] = useState('');
  const { fileUrls, isLoading: isLoadingFiles } = useAdminFileUrls(request?.uploadedFiles);

  useEffect(() => {
    setSelectedStatus(request?.status ?? 'Pending Review');
    setAdminNotes(request?.adminNotes ?? '');
    setRequestProgress(request?.requestProgress ?? '');
  }, [request?.id, request?.status, request?.adminNotes, request?.requestProgress]);

  if (!request) {
    return (
      <aside className="admin-details admin-details--empty">
        <p>Select a custom website request to view full details.</p>
      </aside>
    );
  }

  const details = request.projectDetails || request.project || {};
  const lead = request.leadSummary;
  const isLegacy = Boolean(request.project?.websiteName && !request.websiteGoals?.length);

  const handleSave = async () => {
    await onAdminUpdate(request.id, {
      status: selectedStatus,
      adminNotes,
      requestProgress,
    });
  };

  const hasChanges =
    selectedStatus !== request.status ||
    adminNotes !== (request.adminNotes ?? '') ||
    requestProgress !== (request.requestProgress ?? '');

  return (
    <aside className="admin-details">
      <div className="admin-details__header">
        <div>
          <p className="admin-details__label">Custom Website Request</p>
          <h2>{request.receiptId}</h2>
        </div>
        <button type="button" className="admin-details__close" onClick={onClose} aria-label="Close details">
          ×
        </button>
      </div>

      <LeadSummaryDetails leadSummary={lead} />

      <section className="admin-details__section">
        <h3>Customer</h3>
        <dl className="admin-details__list">
          <div><dt>Name</dt><dd>{request.customer.fullName}</dd></div>
          <div><dt>Phone</dt><dd>{request.customer.phone}</dd></div>
          <div><dt>Email</dt><dd>{request.customer.email}</dd></div>
          <div><dt>Business</dt><dd>{request.customer.businessName}</dd></div>
          <div><dt>Type</dt><dd>{labelForOption(businessTypes, request.customer.businessType)}</dd></div>
        </dl>
      </section>

      {!isLegacy && (
        <>
          <section className="admin-details__section">
            <h3>Website Goals</h3>
            <p>
              {(request.websiteGoals || [])
                .map((id) => labelForOption(websiteGoalOptions, id))
                .join(', ') || '—'}
            </p>
          </section>

          <section className="admin-details__section">
            <h3>Features</h3>
            <p>
              {request.selectedFeatures?.length
                ? request.selectedFeatures.map((id) => labelForOption(featureOptions, id)).join(', ')
                : 'None selected'}
            </p>
          </section>

          <section className="admin-details__section">
            <h3>Project Readiness</h3>
            <dl className="admin-details__list">
              <div><dt>Logo</dt><dd>{readinessLabel(details.hasLogo, readinessOptions)}</dd></div>
              <div><dt>Content</dt><dd>{readinessLabel(details.hasContent, contentReadinessOptions)}</dd></div>
              <div><dt>Domain</dt><dd>{readinessLabel(details.hasDomain, readinessOptions)}</dd></div>
              <div><dt>Examples</dt><dd>{readinessLabel(details.hasExamples, readinessOptions)}</dd></div>
            </dl>
            {details.exampleNotes && <p className="admin-details__notes">{details.exampleNotes}</p>}
            {details.description && (
              <>
                <p className="admin-details__notes-label">Requirements</p>
                <p className="admin-details__notes">{details.description}</p>
              </>
            )}
          </section>

          <section className="admin-details__section">
            <h3>Budget & Timeline</h3>
            <dl className="admin-details__list">
              <div><dt>Budget</dt><dd>{labelForOption(budgetOptions, request.budget)}</dd></div>
              <div><dt>Timeline</dt><dd>{labelForOption(timelineOptions, request.timeline)}</dd></div>
            </dl>
          </section>
        </>
      )}

      {isLegacy && (
        <section className="admin-details__section">
          <h3>Project (Legacy)</h3>
          <dl className="admin-details__list">
            <div><dt>Website Name</dt><dd>{request.project.websiteName}</dd></div>
            <div><dt>Purpose</dt><dd>{request.project.websitePurpose}</dd></div>
          </dl>
          <p className="admin-details__notes">{request.project.description}</p>
        </section>
      )}

      {request.uploadedFiles?.length > 0 && (
        <section className="admin-details__section">
          <h3>Uploaded Files</h3>
          <ul className="admin-details__features">
            {request.uploadedFiles.map((file) => {
              const fileKey = file.storagePath || file.url || file.name;
              const href = fileUrls[fileKey];

              return (
                <li key={fileKey}>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer">
                      {file.name}
                    </a>
                  ) : (
                    <span>
                      {file.name}
                      {isLoadingFiles ? ' (loading…)' : ' (unavailable)'}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="admin-details__section">
        <h3>Pricing</h3>
        <p className="admin-details__price">{request.estimatedPriceRange}</p>
        <p className="admin-details__muted">Submitted {formatDateTime(request.createdAt)}</p>
      </section>

      <section className="admin-details__section">
        <h3>Status Management</h3>
        <select
          className="admin-details__select"
          value={selectedStatus}
          disabled={isUpdating}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          {REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <textarea
          className="admin-details__textarea"
          value={requestProgress}
          disabled={isUpdating}
          onChange={(event) => setRequestProgress(event.target.value)}
          placeholder="Request progress..."
        />
        <textarea
          className="admin-details__textarea"
          value={adminNotes}
          disabled={isUpdating}
          onChange={(event) => setAdminNotes(event.target.value)}
          placeholder="Admin notes..."
        />
        {updateError && <p className="admin-details__error" role="alert">{updateError}</p>}
        <button
          type="button"
          className="btn btn--primary btn--full"
          disabled={isUpdating || !hasChanges}
          onClick={handleSave}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </section>
    </aside>
  );
}
