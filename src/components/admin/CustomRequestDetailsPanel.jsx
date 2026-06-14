import { useEffect, useState } from 'react';
import { businessTypes, featureOptions, pageOptions } from '../../data/customWebsiteOptions';
import { REQUEST_STATUSES } from '../../constants/requestStatuses';
import { useAdminFileUrls } from '../../hooks/useAdminFileUrls';
import { formatDateTime } from '../../utils/formatters';
import './admin.css';

function labelForId(options, id) {
  return options.find((item) => item.id === id)?.label ?? id;
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

      <section className="admin-details__section">
        <h3>Customer</h3>
        <dl className="admin-details__list">
          <div><dt>Name</dt><dd>{request.customer.fullName}</dd></div>
          <div><dt>Phone</dt><dd>{request.customer.phone}</dd></div>
          <div><dt>Email</dt><dd>{request.customer.email}</dd></div>
          <div><dt>Business</dt><dd>{request.customer.businessName}</dd></div>
          <div><dt>Type</dt><dd>{labelForId(businessTypes, request.customer.businessType)}</dd></div>
        </dl>
      </section>

      <section className="admin-details__section">
        <h3>Project</h3>
        <dl className="admin-details__list">
          <div><dt>Website Name</dt><dd>{request.project.websiteName}</dd></div>
          <div><dt>Purpose</dt><dd>{request.project.websitePurpose}</dd></div>
        </dl>
        <p className="admin-details__notes">{request.project.description}</p>
      </section>

      <section className="admin-details__section">
        <h3>Pages & Features</h3>
        <p><strong>Pages:</strong> {request.selectedPages.map((id) => labelForId(pageOptions, id)).join(', ')}</p>
        <p>
          <strong>Features:</strong>{' '}
          {request.selectedFeatures.length
            ? request.selectedFeatures.map((id) => labelForId(featureOptions, id)).join(', ')
            : 'None selected'}
        </p>
      </section>

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
