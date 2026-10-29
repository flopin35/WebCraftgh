import { useState } from 'react';
import {
  BUILDER_UPLOADS,
  COLOR_MODES,
  COLOR_THEMES,
  FONT_PAIRINGS,
  LANGUAGE_OPTIONS,
  TYPOGRAPHY_STYLES,
  VISUAL_STYLES,
  YES_NO_UNSURE,
} from '../../../data/builder/builderOptions';
import { formatCedis } from '../../../utils/builderPricing';
import { contrastLevel, contrastRatio, normalizeHex } from '../../../utils/colorContrast';
import { draftWebsiteCopy } from '../../../utils/copyDrafts';
import { Checkbox, ChoiceGrid, FileDrop, Question, Section, Segmented, StepHeader, TextField } from '../BuilderUI';
import { useGoogleFonts } from '../useGoogleFont';

function ColorInput({ label, value, onChange }) {
  const valid = Boolean(normalizeHex(value));
  return (
    <div className="bld-color">
      <span className="bld-color__label">{label}</span>
      <div className="bld-color__row">
        <input type="color" value={normalizeHex(value) ?? '#000000'} onChange={(event) => onChange(event.target.value)} aria-label={`${label} colour picker`} />
        <input
          className={`bld-field__input bld-color__hex${valid ? '' : ' is-invalid'}`}
          value={value}
          maxLength={7}
          onChange={(event) => onChange(event.target.value.trim())}
          onBlur={() => valid && onChange(normalizeHex(value))}
          aria-label={`${label} hex code`}
          aria-invalid={!valid}
        />
      </div>
      {!valid && <span className="bld-field__hint" style={{ color: '#b91c1c' }}>Use a hex code like #1a2b3c</span>}
    </div>
  );
}

export function StepBranding({ state, updateSection, uploads, onUploadChange, priceList }) {
  const b = state.branding;
  const chooseTheme = (themeId) => {
    const theme = COLOR_THEMES.find((item) => item.id === themeId);
    updateSection('branding', themeId === 'custom' ? { themeId } : { themeId, primary: theme.primary, secondary: theme.secondary, accent: theme.accent });
  };
  const setColor = (key) => (hex) => updateSection('branding', { [key]: hex, themeId: 'custom' });
  const themeOptions = COLOR_THEMES.map((theme) => ({
    ...theme,
    description: (
      <span className="bld-swatches" aria-hidden="true">
        {[theme.primary, theme.secondary, theme.accent].map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
      </span>
    ),
  }));
  const primaryOnSecondary = contrastRatio(normalizeHex(b.primary) ?? '#000000', normalizeHex(b.secondary) ?? '#ffffff');

  return (
    <section className="bld-step">
      <StepHeader title="Colours & branding" subtitle="Start with a preset, then fine-tune. The preview updates instantly." />
      <Section title="Colour theme">
        <ChoiceGrid options={themeOptions} selected={b.themeId} onToggle={chooseTheme} columns={4} />
      </Section>
      <Section title="Your colours" hint="Use the picker or type a hex code like #2563eb.">
        <div className="bld-colors">
          <ColorInput label="Primary" value={b.primary} onChange={setColor('primary')} />
          <ColorInput label="Secondary / background" value={b.secondary} onChange={setColor('secondary')} />
          <ColorInput label="Accent" value={b.accent} onChange={setColor('accent')} />
        </div>
        <p className={`bld-note${primaryOnSecondary < 3 ? ' bld-note--warn' : ''}`}>
          Primary on background contrast: {primaryOnSecondary.toFixed(1)}:1 ({contrastLevel(primaryOnSecondary)}).{' '}
          {primaryOnSecondary < 3
            ? 'These colours are hard to read together — we will adjust text colours automatically to keep things readable.'
            : 'Text will stay readable; we always pick light or dark text automatically for buttons.'}
        </p>
      </Section>
      <Section title="Logo & brand images">
        <div className="bld-uploads">
          <FileDrop category="logo" config={BUILDER_UPLOADS.logo} files={uploads.logo} onChange={onUploadChange} />
          <FileDrop category="brand" config={BUILDER_UPLOADS.brand} files={uploads.brand} onChange={onUploadChange} />
        </div>
        <p className="bld-note">Files are uploaded when you submit. If you leave and come back later, you'll need to re-attach them.</p>
        <Checkbox
          label={`I need a logo designed (+${formatCedis(priceList.design.logoDesign)})`}
          checked={b.wantsLogoDesign}
          onChange={(wantsLogoDesign) => updateSection('branding', { wantsLogoDesign })}
        />
      </Section>
      <Section title="Brand guidelines">
        <Question label="Do you already have brand guidelines?" options={YES_NO_UNSURE} value={b.hasGuidelines} onChange={(hasGuidelines) => updateSection('branding', { hasGuidelines })} />
        {b.hasGuidelines === 'yes' && (
          <TextField
            label="Anything we must follow? (or upload them in the Content step)"
            value={b.guidelinesNotes}
            onChange={(guidelinesNotes) => updateSection('branding', { guidelinesNotes })}
            multiline
            maxLength={1000}
          />
        )}
        {b.hasGuidelines === 'no' && (
          <Checkbox
            label={`Create simple brand guidelines for me (+${formatCedis(priceList.design.brandGuidelinesHelp)})`}
            checked={b.wantsGuidelinesHelp}
            onChange={(wantsGuidelinesHelp) => updateSection('branding', { wantsGuidelinesHelp })}
          />
        )}
      </Section>
    </section>
  );
}

export function StepStyle({ state, updateSection, priceList }) {
  const s = state.style;
  const fonts = FONT_PAIRINGS.filter((font) => s.typographyStyle === 'all' || font.category === s.typographyStyle);
  useGoogleFonts(FONT_PAIRINGS);
  const refs = s.references?.length ? s.references : [{ url: '', likes: '' }];
  const setRef = (index, patch) => updateSection('style', { references: refs.map((ref, i) => (i === index ? { ...ref, ...patch } : ref)) });
  const styleOptions = VISUAL_STYLES.map((style) => ({
    ...style,
    description: priceList.design.styleSurcharge?.[style.id] ? `+${formatCedis(priceList.design.styleSurcharge[style.id])}` : 'No extra cost',
  }));

  return (
    <section className="bld-step">
      <StepHeader title="Style & typography" subtitle="Set the overall look and feel. Watch the preview change as you choose." />
      <Section title="Visual style">
        <ChoiceGrid options={styleOptions} selected={s.styleId} onToggle={(styleId) => updateSection('style', { styleId })} columns={3} />
      </Section>
      <Section title="Light or dark?" hint={priceList.design.colorMode.both ? `Offering both adds ${formatCedis(priceList.design.colorMode.both)}.` : undefined}>
        <Segmented options={COLOR_MODES} value={s.colorMode} onChange={(colorMode) => updateSection('style', { colorMode })} label="Colour mode" />
      </Section>
      <Section title="Fonts" hint="All fonts are free, web-optimised and readable on phones.">
        <Segmented options={TYPOGRAPHY_STYLES} value={s.typographyStyle} onChange={(typographyStyle) => updateSection('style', { typographyStyle })} label="Typography style" />
        <div className="bld-fonts">
          {fonts.map((font) => (
            <button
              key={font.id}
              type="button"
              className={`bld-font${s.fontId === font.id ? ' is-selected' : ''}`}
              aria-pressed={s.fontId === font.id}
              onClick={() => updateSection('style', { fontId: font.id })}
            >
              <span style={{ fontFamily: `'${font.heading}', serif` }} className="bld-font__heading">
                {state.text.projectName || 'Your Business'}
              </span>
              <span style={{ fontFamily: `'${font.body}', sans-serif` }} className="bld-font__body">
                Clear, friendly text your customers can read.
              </span>
              <small>{font.label}</small>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Websites you like (optional)" hint="Share up to 5 links and tell us what you like about each.">
        {refs.map((ref, index) => (
          <div className="bld-ref" key={index}>
            <input
              className="bld-field__input"
              type="url"
              placeholder="https://example.com"
              value={ref.url}
              maxLength={300}
              onChange={(event) => setRef(index, { url: event.target.value })}
              aria-label={`Reference website ${index + 1}`}
            />
            <input
              className="bld-field__input"
              placeholder="What do you like? e.g. the colours, the layout, the photos"
              value={ref.likes}
              maxLength={500}
              onChange={(event) => setRef(index, { likes: event.target.value })}
              aria-label={`What you like about reference ${index + 1}`}
            />
            {refs.length > 1 && (
              <button type="button" className="bld-link-btn" onClick={() => updateSection('style', { references: refs.filter((_, i) => i !== index) })}>
                Remove
              </button>
            )}
          </div>
        ))}
        {refs.length < 5 && (
          <button type="button" className="btn btn--outline" onClick={() => updateSection('style', { references: [...refs, { url: '', likes: '' }] })}>
            + Add another
          </button>
        )}
      </Section>
    </section>
  );
}

export function StepText({ state, updateSection, toggleIn, priceList }) {
  const t = state.text;
  const [draftNote, setDraftNote] = useState('');
  const set = (key) => (value) => updateSection('text', { [key]: value });

  const runDraft = (overwrite) => {
    const draft = draftWebsiteCopy(state);
    const patch = {};
    for (const [key, value] of Object.entries(draft)) {
      if (overwrite || !t[key]?.trim()) patch[key] = value;
    }
    updateSection('text', patch);
    setDraftNote(
      Object.keys(patch).length
        ? 'Draft added. Please read and edit it — check every fact before approving.'
        : 'Your fields are already filled. Use "Replace with new draft" to overwrite them.'
    );
  };

  return (
    <section className="bld-step">
      <StepHeader title="Your website text" subtitle="Tell us what to say. Not sure? Use the draft helper, then edit it in your own words." />
      <TextField label="Business or project name" value={t.projectName} onChange={set('projectName')} maxLength={120} required />

      <div className="bld-draft">
        <div>
          <strong>Need a starting point?</strong>
          <p>We'll draft a headline, description and buttons from your answers. You can edit everything.</p>
        </div>
        <div className="bld-draft__actions">
          <button type="button" className="btn btn--outline" onClick={() => runDraft(false)} disabled={!t.projectName.trim()}>
            ✨ Draft text for me
          </button>
          <button type="button" className="bld-link-btn" onClick={() => runDraft(true)} disabled={!t.projectName.trim()}>
            Replace with new draft
          </button>
        </div>
        {draftNote && (
          <p className="bld-note" role="status">
            {draftNote}
          </p>
        )}
      </div>

      <TextField label="Main homepage headline" value={t.headline} onChange={set('headline')} maxLength={200} placeholder="e.g. Fresh pastries baked in Osu every morning" />
      <TextField label="Supporting description" value={t.description} onChange={set('description')} multiline maxLength={1000} />
      <div className="bld-two">
        <TextField label="Main button text" value={t.ctaPrimary} onChange={set('ctaPrimary')} maxLength={60} />
        <TextField label="Second button text" value={t.ctaSecondary} onChange={set('ctaSecondary')} maxLength={60} />
      </div>
      <TextField
        label="Your products or services"
        value={t.offerings}
        onChange={set('offerings')}
        multiline
        maxLength={3000}
        hint="One per line, with a short description and price if you like. "
      />
      <TextField label="Names, terms or spellings we must keep exactly" value={t.brandTerms} onChange={set('brandTerms')} maxLength={500} placeholder="e.g. Ama's Kitchen™, 'Kenkey Express' (not Kenkey Xpress)" />
      <TextField label="Existing website (if any)" value={t.existingSiteUrl} onChange={set('existingSiteUrl')} maxLength={300} type="url" placeholder="https://" />
      <TextField label="Paste any existing text you'd like us to use" value={t.existingText} onChange={set('existingText')} multiline maxLength={5000} />
      <Checkbox
        label={`I'd like WebCraft to write or polish the text (+${formatCedis(priceList.content.copywritingPerPage)} per page)`}
        description="A copywriter prepares the text for your approval. Your facts and brand terms are preserved."
        checked={t.copywritingHelp}
        onChange={set('copywritingHelp')}
      />
      <Section title="Languages" hint={`English is included. Each extra language adds about ${formatCedis(priceList.content.extraLanguagePerLanguage)}.`}>
        <ChoiceGrid
          options={LANGUAGE_OPTIONS.map((lang) => ({ ...lang, locked: lang.id === 'en' }))}
          selected={t.languages}
          onToggle={(id) => toggleIn('languages', id, 'text')}
          multiple
          columns={3}
        />
      </Section>
    </section>
  );
}
