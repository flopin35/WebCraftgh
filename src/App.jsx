import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Request from './pages/Request/Request';
import Admin from './pages/Admin/Admin';
import SystemCheck from './pages/Admin/SystemCheck';
import Receipt from './pages/Receipt/Receipt';
import AdminRoute, { AuthRedirectHandler } from './components/admin/AdminRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthRedirectHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request" element={<Request />} />
        <Route path="/receipt" element={<Receipt />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<Admin />} />
          <Route path="/admin/requests" element={<Admin />} />
          <Route path="/admin/system-check" element={<SystemCheck />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
