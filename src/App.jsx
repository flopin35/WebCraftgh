import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Portfolio from './pages/Portfolio/Portfolio';
import Request from './pages/Request/Request';
import CustomRequest from './pages/CustomRequest/CustomRequest';
import CustomReceipt from './pages/CustomReceipt/CustomReceipt';
import Admin from './pages/Admin/Admin';
import SystemCheck from './pages/Admin/SystemCheck';
import Receipt from './pages/Receipt/Receipt';
import Builder from './pages/Builder/Builder';
import BuilderSubmitted from './pages/BuilderSubmitted/BuilderSubmitted';
import CustomEstimate from './pages/CustomEstimate/CustomEstimate';
import TrackRequest from './pages/TrackRequest/TrackRequest';
import PriceListEditor from './pages/Admin/PriceListEditor';
import AdminRoute, { AuthRedirectHandler } from './components/admin/AdminRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthRedirectHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/request" element={<Request />} />
        <Route path="/custom-request" element={<CustomRequest />} />
        <Route path="/custom-receipt" element={<CustomReceipt />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/build" element={<Builder />} />
        <Route path="/build/submitted" element={<BuilderSubmitted />} />
        <Route path="/custom-estimate" element={<CustomEstimate />} />
        <Route path="/track" element={<TrackRequest />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<Admin />} />
          <Route path="/admin/requests" element={<Admin />} />
          <Route path="/admin/system-check" element={<SystemCheck />} />
          <Route path="/admin/pricing" element={<PriceListEditor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
