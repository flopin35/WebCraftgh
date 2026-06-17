import Navbar from '../../components/Navbar/Navbar';
import CustomRequestHeader from '../../components/custom/CustomRequestHeader';
import CustomRequestWizard from '../../components/custom/wizard/CustomRequestWizard';
import '../../components/custom/CustomRequest.css';
import '../../components/custom/wizard/CustomWizard.css';

export default function CustomRequest() {
  return (
    <>
      <Navbar />

      <main className="custom-request-page">
        <div className="container custom-request-page__inner">
          <CustomRequestHeader />
          <CustomRequestWizard />
        </div>
      </main>
    </>
  );
}
