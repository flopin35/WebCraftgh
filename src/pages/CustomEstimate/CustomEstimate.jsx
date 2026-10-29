import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { Checkbox, ChoiceGrid, ErrorList, FileDrop, Section, TextField } from '../../components/builder/BuilderUI';
import { BUILDER_UPLOADS, CONTACT_METHODS } from '../../data/builder/builderOptions';
import { createInitialEstimateState } from '../../data/builder/initialState';
import { submitCustomEstimate } from '../../services/builderService';
import { validateCustomEstimate } from '../../utils/builderValidation';
import { getFromStorage, saveToStorage } from '../../utils/storage';
import '../../components/builder/builder.css';

const KEY = 'customEstimateDraft';
const BUDGET_RANGES = ['Under GH₵10,000', 'GH₵10,000 – 20,000', 'GH₵20,000 – 50,000', 'Above GH₵50,000', 'Not sure yet'];

export default function CustomEstimate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromBuilder = params.get('from') === 'builder';
  const [data, setData] = useState(() => ({ ...createInitialEstimateState(), ...(getFromStorage(KEY, {}) ?? {}) }));
  const [uploads, setUploads] = useState({ documents: [] });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    saveToStorage(KEY, data);
  }, [data]);

  useEffect(() => {
    if (!fromBuilder) return;
    const draft = getFromStorage('builderDraft', null);
    if (!draft) return;
    setData((current) => ({
      ...current,
      fullName: current.fullName || draft.customer?.fullName || '',
      businessName: current.businessName || draft.customer?.businessName || draft.text?.projectName || '',
      email: current.email || draft.customer?.email || '',
      phone: current.phone || draft.customer?.phone || '',
      description: current.description || [draft.goalText, draft.text?.description].filter(Boolean).join('\n\n'),
    }));
  }, [fromBuilder]);

  const set = (key) => (value) => setData((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const validation = validateCustomEstimate(data);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    const result = await submitCustomEstimate({ data, uploads, origin: fromBuilder ? 'builder' : 'direct' });
    setSubmitting(false);
    if (!result.success) {
      setErrors([result.error, 'Your answers are saved — you can try again.']);
      return;
    }
    saveToStorage(KEY, createInitialEstimateState());
    navigate('/build/submitted', { state: { request: result.request } });
  };

  return (
    <>
      <Navbar />
      <main className="bld-page">
        <form className="container bld-estimate" onSubmit={submit} noValidate>
          <header className="bld-step__header">
            <p className="bld-intro__eyebrow">Custom estimate</p>
            <h1 className="bld-step__title">Tell us about your project</h1>
            <p className="bld-step__subtitle">
              For budgets above GH₵10,000, complex platforms, integrations or anything unusual — at any budget. Complex requirements need a short review, so
              our team will assess your brief and send a personal quotation.
            </p>
          </header>

          <TextField label="Project description" value={data.description} onChange={set('description')} multiline maxLength={5000} required hint="What are you building, who is it for, and why? " />
          <TextField
            label="Functionality you need"
            value={data.functionality}
            onChange={set('functionality')}
            multiline
            maxLength={5000}
            hint="List key features, integrations (MoMo, accounting, SMS…), user roles. "
          />
          <Section title="Budget range (if known)">
            <ChoiceGrid options={BUDGET_RANGES.map((label) => ({ id: label, label }))} selected={data.budgetRange} onToggle={set('budgetRange')} columns={3} />
          </Section>
          <div className="bld-field">
            <label className="bld-field__label" htmlFor="ce-date">
              Preferred completion date
            </label>
            <input id="ce-date" type="date" className="bld-field__input" value={data.completionDate} onChange={(e) => set('completionDate')(e.target.value)} />
          </div>
          <Section title="Reference documents (optional)" hint="Specs, wireframes, screenshots, brochures.">
            <FileDrop category="documents" config={BUILDER_UPLOADS.documents} files={uploads.documents} onChange={(c, files) => setUploads({ [c]: files })} />
          </Section>

          <Section title="Your details">
            <div className="bld-two">
              <TextField label="Your name" value={data.fullName} onChange={set('fullName')} maxLength={120} required autoComplete="name" />
              <TextField label="Business or organization" value={data.businessName} onChange={set('businessName')} maxLength={120} />
              <TextField label="Email address" type="email" value={data.email} onChange={set('email')} maxLength={120} required autoComplete="email" />
              <TextField label="Phone / WhatsApp" type="tel" value={data.phone} onChange={set('phone')} maxLength={30} autoComplete="tel" />
            </div>
            <ChoiceGrid options={CONTACT_METHODS} selected={data.contactMethod} onToggle={set('contactMethod')} columns={3} />
          </Section>

          <div className="bld-privacy">
            <strong>Privacy notice</strong>
            <p>
              We use your details and project information only to assess your request, prepare a quotation and contact you about it. Your data is stored
              securely, is only accessible to the WebCraft team, and is never sold or shared. Ask us any time to correct or delete it.
            </p>
          </div>
          <Checkbox label="I agree to WebCraft using my details as described above" checked={data.consent} onChange={set('consent')} />

          <ErrorList errors={errors} />
          <div className="bld-nav">
            <span />
            <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
              {submitting ? 'Sending…' : 'Request custom estimate'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
