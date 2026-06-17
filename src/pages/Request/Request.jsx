import Navbar from '../../components/Navbar/Navbar';
import TemplateRequestWizard from '../../components/template/wizard/TemplateRequestWizard';
import './Request.css';

export default function Request() {
  return (
    <>
      <Navbar />

      <main className="request-page">
        <div className="container request-page__inner request-page__inner--wizard">
          <TemplateRequestWizard />
        </div>
      </main>
    </>
  );
}
