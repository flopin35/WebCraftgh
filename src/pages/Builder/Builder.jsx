import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import WebsiteBuilder from '../../components/builder/WebsiteBuilder';
import { hasSavedBuilderDraft } from '../../hooks/useBuilderDraft';
import { getFromStorage, removeFromStorage } from '../../utils/storage';
import '../../components/builder/builder.css';

const STEPS = ['Set your budget', 'Choose type, pages & features', 'Pick colours, style & fonts', 'Watch the live preview', 'Submit for an accurate quote'];

export default function Builder() {
  const [started, setStarted] = useState(false);
  const [hasDraft, setHasDraft] = useState(() => hasSavedBuilderDraft());
  const draftName = getFromStorage('builderDraft', null)?.text?.projectName;

  if (started) {
    return (
      <>
        <Navbar />
        <main className="bld-page">
          <div className="container">
            <WebsiteBuilder />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bld-page">
        <div className="container bld-intro">
          <div className="bld-intro__text">
            <p className="bld-intro__eyebrow">Website builder</p>
            <h1>Build your website, your way — within your budget.</h1>
            <p>
              Customize a website to suit your needs and budget. Choose your pages, colours, style and features, see a live preview as you go, and get a
              clear estimate. No account needed, and your progress is saved on this device so you can finish later.
            </p>
            <div className="bld-intro__actions">
              {hasDraft ? (
                <>
                  <button type="button" className="btn btn--primary btn--lg" onClick={() => setStarted(true)}>
                    Continue {draftName ? `“${draftName}”` : 'where you left off'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--lg"
                    onClick={() => {
                      removeFromStorage('builderDraft');
                      setHasDraft(false);
                      setStarted(true);
                    }}
                  >
                    Start over
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn--primary btn--lg" onClick={() => setStarted(true)}>
                  Build Your Website
                </button>
              )}
              <Link to="/custom-estimate" className="btn btn--outline btn--lg">
                Get a Custom Estimate
              </Link>
            </div>
            <p className="bld-intro__fine">Takes about 10 minutes. Budgets from GH₵1,000 to GH₵10,000 — larger or unusual projects use a custom estimate.</p>
          </div>
          <ol className="bld-intro__steps">
            {STEPS.map((step, i) => (
              <li key={step}>
                <span>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </main>
    </>
  );
}
