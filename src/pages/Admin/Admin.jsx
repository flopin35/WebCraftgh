import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminFilters from '../../components/admin/AdminFilters';
import OverviewCards from '../../components/admin/OverviewCards';
import RequestDetailsPanel from '../../components/admin/RequestDetailsPanel';
import RequestsTable from '../../components/admin/RequestsTable';
import Navbar from '../../components/Navbar/Navbar';
import { logoutAdmin } from '../../services/adminAuthService';
import {
  subscribeToRequests,
  updateRequestAdminFields,
} from '../../services/adminRequestService';
import { filterRequests, getOverviewCounts } from '../../utils/adminFilters';
import './Admin.css';

const initialFilters = {
  search: '',
  status: '',
  template: '',
  date: '',
};

export default function Admin() {
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setLoadError('');

    const unsubscribe = subscribeToRequests(
      (nextRequests) => {
        setRequests(nextRequests);
        setIsLoading(false);
        setLoadError('');
      },
      () => {
        setLoadError('Unable to load requests. Please refresh and try again.');
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const filteredRequests = useMemo(
    () => filterRequests(requests, filters),
    [requests, filters]
  );

  const overviewCounts = useMemo(() => getOverviewCounts(requests), [requests]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? null,
    [requests, selectedRequestId]
  );

  const handleLogout = async () => {
    await logoutAdmin();
    setSelectedRequestId(null);
    setRequests([]);
  };

  const handleAdminUpdate = async (requestId, fields) => {
    setIsUpdating(true);
    setUpdateError('');

    const result = await updateRequestAdminFields(requestId, fields);

    if (!result.success) {
      setUpdateError(result.error);
    }

    setIsUpdating(false);
  };

  return (
    <>
      <Navbar />

      <main className="admin-page">
        <div className="container admin-page__inner">
          <header className="admin-page__header">
            <div>
              <p className="admin-page__label">Admin Dashboard</p>
              <h1>Website Request Management</h1>
              <p className="admin-page__subtitle">
                Monitor submissions in real time, review details, and update request status.
              </p>
            </div>
            <div className="admin-page__actions">
              <Link to="/admin/system-check" className="btn btn--outline">
                System Check
              </Link>
              <Link to="/" className="btn btn--outline">
                View Site
              </Link>
              <button type="button" className="btn btn--outline" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </header>

          {loadError && (
            <p className="admin-page__error" role="alert">
              {loadError}
            </p>
          )}

          <OverviewCards counts={overviewCounts} isLoading={isLoading} />
          <AdminFilters filters={filters} onChange={setFilters} />

          <div className="admin-page__content">
            <RequestsTable
              requests={filteredRequests}
              selectedId={selectedRequest?.id}
              onSelect={(request) => setSelectedRequestId(request.id)}
              isLoading={isLoading}
            />

            <RequestDetailsPanel
              request={selectedRequest}
              onClose={() => setSelectedRequestId(null)}
              onAdminUpdate={handleAdminUpdate}
              isUpdating={isUpdating}
              updateError={updateError}
            />
          </div>
        </div>
      </main>
    </>
  );
}
