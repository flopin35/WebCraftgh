import { useEffect, useRef, useState } from 'react';
import { ALLOWED_UPLOAD_TYPES } from '../../data/customWebsiteOptions';
import { isAllowedUploadFile, resolveUploadContentType } from '../../utils/uploadValidation';
import './CustomRequest.css';

const CATEGORY_META = {
  logo: {
    description: 'Your brand mark — square or horizontal works best',
    formats: 'PNG · JPG · WEBP · SVG',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="9" cy="9" r="2" fill="currentColor" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  reference: {
    description: 'Screenshots, mockups, or sites you like',
    formats: 'PNG · JPG · WEBP',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="8" cy="10" r="2" fill="currentColor" />
        <path d="M22 16l-5-5-4 4-3-3-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  document: {
    description: 'Briefs, brand guides, or written specs',
    formats: 'PDF · PNG · JPG',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
};

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file) {
  const type = resolveUploadContentType(file);
  return type.startsWith('image/') && type !== 'image/svg+xml';
}

function FilePreview({ file }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const isImage = isImageFile(file);
  const isPdf = resolveUploadContentType(file) === 'application/pdf';

  useEffect(() => {
    if (!isImage) return undefined;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  if (isImage && previewUrl) {
    return <img src={previewUrl} alt="" className="custom-upload-file__thumb-img" />;
  }

  return (
    <span className="custom-upload-file__thumb-icon" aria-hidden="true">
      {isPdf ? 'PDF' : 'FILE'}
    </span>
  );
}

function UploadCard({ category, config, files, onUploadChange, onRemoveFile }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const meta = CATEGORY_META[category];
  const atLimit = files.length >= config.maxFiles;
  const canAddMore = !atLimit;

  const processFiles = (fileList) => {
    if (!fileList?.length) return;

    const incoming = Array.from(fileList);
    const errors = [];
    const valid = [];

    for (const file of incoming) {
      const maxBytes = config.maxSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        errors.push(`${file.name} exceeds ${config.maxSizeMb}MB.`);
        continue;
      }

      const validationError = isAllowedUploadFile(file, category, config);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      valid.push(file);
    }

    if (errors.length) {
      setError(errors.join(' '));
    } else {
      setError('');
    }

    if (!valid.length) return;

    const merged = config.multiple
      ? [...files, ...valid].slice(0, config.maxFiles)
      : valid.slice(0, 1);

    onUploadChange(category, merged);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleInputChange = (event) => {
    processFiles(event.target.files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (!canAddMore) return;
    processFiles(event.dataTransfer.files);
  };

  const openPicker = () => {
    if (canAddMore) {
      inputRef.current?.click();
    }
  };

  return (
    <article className={`custom-upload-card${files.length ? ' custom-upload-card--filled' : ''}`}>
      <div className="custom-upload-card__header">
        <span className="custom-upload-card__icon">{meta.icon}</span>
        <div className="custom-upload-card__heading">
          <div className="custom-upload-card__title-row">
            <h3 className="custom-upload-card__title">{config.label}</h3>
            <span className="custom-upload-card__badge">
              {files.length}/{config.maxFiles}
            </span>
          </div>
          <p className="custom-upload-card__desc">{meta.description}</p>
          <p className="custom-upload-card__formats">{meta.formats}</p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="custom-upload-file-list">
          {files.map((file, index) => (
            <li key={`${category}-${file.name}-${file.size}-${file.lastModified}`} className="custom-upload-file">
              <div className="custom-upload-file__thumb">
                <FilePreview file={file} />
              </div>
              <div className="custom-upload-file__info">
                <span className="custom-upload-file__name">{file.name}</span>
                <span className="custom-upload-file__size">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="custom-upload-file__remove"
                onClick={() => onRemoveFile(category, index)}
                aria-label={`Remove ${file.name}`}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {canAddMore && (
        <div
          className={`custom-upload-dropzone${isDragging ? ' custom-upload-dropzone--active' : ''}${
            files.length ? ' custom-upload-dropzone--compact' : ''
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${config.label.toLowerCase()}`}
        >
          <input
            ref={inputRef}
            id={`upload-${category}`}
            type="file"
            className="custom-upload-dropzone__input"
            accept={config.accept}
            multiple={config.multiple}
            onChange={handleInputChange}
            tabIndex={-1}
          />
          <span className="custom-upload-dropzone__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4m0 0L8 8m4-4l4 4M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="custom-upload-dropzone__label">
            {files.length ? 'Add another file' : 'Tap to upload or drag here'}
          </span>
          <span className="custom-upload-dropzone__hint">
            Max {config.maxSizeMb}MB · up to {config.maxFiles} file{config.maxFiles > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {atLimit && (
        <p className="custom-upload-card__limit">Maximum {config.maxFiles} file{config.maxFiles > 1 ? 's' : ''} reached.</p>
      )}

      {error && (
        <p className="custom-upload-card__error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}

export default function CustomUploadSection({ uploads, onUploadChange, onRemoveFile }) {
  return (
    <section className="request-card custom-section custom-upload-section">
      <div className="custom-upload-section__intro">
        <h2 className="request-card__title">Optional Uploads</h2>
        <p className="custom-section__intro">
          Share your logo, reference designs, or supporting documents to help us understand your
          vision.
        </p>
      </div>

      <div className="custom-upload-grid">
        {Object.entries(ALLOWED_UPLOAD_TYPES).map(([category, config]) => (
          <UploadCard
            key={category}
            category={category}
            config={config}
            files={uploads[category] || []}
            onUploadChange={onUploadChange}
            onRemoveFile={onRemoveFile}
          />
        ))}
      </div>
    </section>
  );
}
