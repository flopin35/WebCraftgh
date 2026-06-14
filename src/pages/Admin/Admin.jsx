import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminFilters from '../../components/admin/AdminFilters';
import CustomRequestDetailsPanel from '../../components/admin/CustomRequestDetailsPanel';
import CustomRequestsTable from '../../components/admin/CustomRequestsTable';
import OverviewCards from '../../components/admin/OverviewCards';
import RequestDetailsPanel from '../../components/admin/RequestDetailsPanel';
import RequestsTable from '../../components/admin/RequestsTable';
import Navbar from '../../components/Navbar/Navbar';
import { logoutAdmin } from '../../services/adminAuthService';
import {
  subscribeToCustomRequests,
  updateCustomRequestAdminFields,
} from '../../services/adminCustomRequestService';
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
  const [activeTab, setActiveTab] = useState('template');
  const [templateRequests, setTemplateRequests] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setLoadError('');

    const unsubscribeTemplate = subscribeToRequests(
      (nextRequests) => {
        setTemplateRequests(nextRequests);
        setIsLoading(false);
      },
      () => {
        setLoadError('Unable to load template requests.');
        setIsLoading(false);
      }
    );

    const unsubscribeCustom = subscribeToCustomRequests(
      (nextRequests) => {
        setCustomRequests(nextRequests);
        setIsLoading(false);
      },
      () => {
        setLoadError('Unable to load custom website requests.');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeTemplate();
      unsubscribeCustom();
    };
  }, []);

  const requests = activeTab === 'template' ? templateRequests : customRequests;

  const filteredRequests = useMemo(
    () => (activeTab === 'template' ? filterRequests(templateRequests, filters) : customRequests),
    [activeTab, templateRequests, customRequests, filters]
  );

  const overviewCounts = useMemo(
    () => getOverviewCounts(activeTab === 'template' ? templateRequests : customRequests),
    [activeTab, templateRequests, customRequests]
  );

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? null,
    [requests, selectedRequestId]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedRequestId(null);
    setUpdateError('');
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setSelectedRequestId(null);
    setTemplateRequests([]);
    setCustomRequests([]);
  };

  const handleAdminUpdate = async (requestId, fields) => {
    setIsUpdating(true);
    setUpdateError('');

    const result =
      activeTab === 'template'
        ? await updateRequestAdminFields(requestId, fields)
        : await updateCustomRequestAdminFields(requestId, fields);

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
                Monitor template and custom website submissions in real time.
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

          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tabs__btn${activeTab === 'template' ? ' is-active' : ''}`}
              onClick={() => handleTabChange('template')}
            >
              Template Requests ({templateRequests.length})
            </button>
            <button
              type="button"
              className={`admin-tabs__btn${activeTab === 'custom' ? ' is-active' : ''}`}
              onClick={() => handleTabChange('custom')}
            >
              Custom Requests ({customRequests.length})
            </button>
          </div>

          {loadError && (
            <p className="admin-page__error" role="alert">
              {loadError}
            </p>
          )}

          <OverviewCards counts={overviewCounts} isLoading={isLoading} />
          {activeTab === 'template' && <AdminFilters filters={filters} onChange={setFilters} />}

          <div className="admin-page__content">
            {activeTab === 'template' ? (
              <RequestsTable
                requests={filteredRequests}
                selectedId={selectedRequest?.id}
                onSelect={(request) => setSelectedRequestId(request.id)}
                isLoading={isLoading}
              />
            ) : (
              <CustomRequestsTable
                requests={filteredRequests}
                selectedId={selectedRequest?.id}
                onSelect={(request) => setSelectedRequestId(request.id)}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'template' ? (
              <RequestDetailsPanel
                request={selectedRequest}
                onClose={() => setSelectedRequestId(null)}
                onAdminUpdate={handleAdminUpdate}
                isUpdating={isUpdating}
                updateError={updateError}
              />
            ) : (
              <CustomRequestDetailsPanel
                request={selectedRequest}
                onClose={() => setSelectedRequestId(null)}
                onAdminUpdate={handleAdminUpdate}
                isUpdating={isUpdating}
                updateError={updateError}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
