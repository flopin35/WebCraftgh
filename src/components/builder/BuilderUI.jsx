/** Small shared form primitives for the website builder. */

export function StepHeader({ title, subtitle }) {
  return (
    <header className="bld-step__header">
      <h2 className="bld-step__title" tabIndex={-1} data-step-heading>
        {title}
      </h2>
      {subtitle && <p className="bld-step__subtitle">{subtitle}</p>}
    </header>
  );
}

export function Section({ title, hint, children }) {
  return (
    <fieldset className="bld-section">
      {title && <legend className="bld-section__title">{title}</legend>}
      {hint && <p className="bld-section__hint">{hint}</p>}
      {children}
    </fieldset>
  );
}

/** Multi- or single-select cards. */
export function ChoiceGrid({ options, selected, onToggle, multiple = false, columns = 3, renderExtra }) {
  const isSelected = (id) => (multiple ? (selected ?? []).includes(id) : selected === id);
  return (
    <div className={`bld-choices bld-choices--${columns}`} role={multiple ? 'group' : 'radiogroup'}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role={multiple ? 'checkbox' : 'radio'}
          aria-checked={isSelected(option.id)}
          disabled={option.locked}
          className={`bld-choice${isSelected(option.id) ? ' is-selected' : ''}${option.locked ? ' is-locked' : ''}`}
          onClick={() => onToggle(option.id)}
        >
          {option.icon && (
            <span className="bld-choice__icon" aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span className="bld-choice__label">{option.label}</span>
          {option.description && <span className="bld-choice__desc">{option.description}</span>}
          {renderExtra?.(option)}
          {option.locked && <span className="bld-choice__badge">Included</span>}
        </button>
      ))}
    </div>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="bld-segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          className={`bld-segmented__btn${value === option.id ? ' is-selected' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Question({ label, options, value, onChange }) {
  return (
    <div className="bld-question">
      <span className="bld-question__label">{label}</span>
      <Segmented options={options} value={value} onChange={onChange} label={label} />
    </div>
  );
}

export function TextField({ label, value, onChange, multiline = false, maxLength = 500, hint, required, ...rest }) {
  const id = rest.id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div className="bld-field">
      <label htmlFor={id} className="bld-field__label">
        {label}
        {required && <span className="bld-field__req"> *</span>}
      </label>
      <Tag
        id={id}
        className="bld-field__input"
        value={value ?? ''}
        maxLength={maxLength}
        rows={multiline ? 4 : undefined}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />
      {(hint || multiline) && (
        <span className="bld-field__hint">
          {hint}
          {multiline && <span className="bld-field__count">{(value ?? '').length}/{maxLength}</span>}
        </span>
      )}
    </div>
  );
}

export function Checkbox({ label, checked, onChange, description }) {
  return (
    <label className="bld-check">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <span className="bld-check__label">{label}</span>
        {description && <span className="bld-check__desc">{description}</span>}
      </span>
    </label>
  );
}

export function ErrorList({ errors }) {
  if (!errors?.length) return null;
  return (
    <div className="bld-errors" role="alert">
      {errors.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>
  );
}

export function FileDrop({ category, config, files, onChange }) {
  const handle = (event) => {
    const picked = [...(event.target.files ?? [])];
    const merged = [...files, ...picked].slice(0, config.maxFiles);
    onChange(category, merged);
    event.target.value = '';
  };
  const tooBig = files.filter((file) => file.size > config.maxSizeMb * 1024 * 1024);
  return (
    <div className="bld-upload">
      <label className="bld-upload__drop">
        <input type="file" accept={config.accept} multiple={config.maxFiles > 1} onChange={handle} disabled={files.length >= config.maxFiles} />
        <strong>{config.label}</strong>
        <span>
          Up to {config.maxFiles} file{config.maxFiles > 1 ? 's' : ''}, {config.maxSizeMb}MB each
        </span>
      </label>
      {files.length > 0 && (
        <ul className="bld-upload__list">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className={tooBig.includes(file) ? 'is-invalid' : ''}>
              <span>
                {file.name} <small>({(file.size / 1024 / 1024).toFixed(1)}MB)</small>
                {tooBig.includes(file) && <em> — too large, will be skipped</em>}
              </span>
              <button type="button" onClick={() => onChange(category, files.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
