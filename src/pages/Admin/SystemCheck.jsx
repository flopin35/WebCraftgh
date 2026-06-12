import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import {
  logProductionCheckReport,
  runProductionChecks,
} from '../../services/productionCheckService';
import './SystemCheck.css';

export default function SystemCheck() {
  const [report, setReport] = useState(null);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let active = true;

    async function runChecks() {
      setIsRunning(true);
      const result = await runProductionChecks();

      if (active) {
        setReport(result);
        setIsRunning(false);
        logProductionCheckReport(result);
      }
    }

    runChecks();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />

      <main className="system-check-page">
        <div className="container system-check-page__inner">
          <header className="system-check-page__header">
            <div>
              <p className="system-check-page__label">Production Test Mode</p>
              <h1>System Check</h1>
              <p className="system-check-page__subtitle">
                Verify that WebCraft is connected, secure, and ready for deployment.
              </p>
            </div>
            <Link to="/admin" className="btn btn--outline">
              Back to Dashboard
            </Link>
          </header>

          {isRunning && <p className="system-check-page__loading">Running production checks...</p>}

          {report && (
            <>
              <div
                className={`system-check-page__summary${report.ready ? ' is-ready' : ' is-warning'}`}
              >
                <strong>
                  {report.ready
                    ? 'All systems ready for production.'
                    : `${report.passed}/${report.total} checks passed. Review items below.`}
                </strong>
              </div>

              <ul className="system-check-page__list">
                {report.checks.map((check) => (
                  <li
                    key={check.id}
                    className={`system-check-page__item${check.success ? ' is-pass' : ' is-fail'}`}
                  >
                    <span className="system-check-page__icon" aria-hidden="true">
                      {check.success ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="system-check-page__item-title">{check.label}</p>
                      <p className="system-check-page__item-message">{check.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </>
  );
}
