import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getOrganizations } from '../../services/organizationApi';
import { apiRequest } from '../../services/api';
import { showToast } from '../../store/slices/toastSlice';
import { publicSiteUrl } from './miniSiteUtils';
import './MiniSitesLanding.css';

function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function StatusBadge({ status, rejectionReason }) {
  const getStatusConfig = () => {
    switch(status) {
      case 'pending':
        return { emoji: '⏳', text: 'Awaiting admin approval', bgColor: '#fbbf24', textColor: '#000' };
      case 'approved':
        return { emoji: '✅', text: 'Active', bgColor: '#10b981', textColor: '#fff' };
      case 'rejected':
        return { emoji: '❌', text: `Rejected: ${rejectionReason || 'No reason provided'}`, bgColor: '#ef4444', textColor: '#fff' };
      default:
        return { emoji: '❓', text: 'Unknown', bgColor: '#6b7280', textColor: '#fff' };
    }
  };

  const config = getStatusConfig();

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '6px',
      backgroundColor: config.bgColor,
      color: config.textColor,
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '8px'
    }}>
      <span>{config.emoji}</span>
      <span>{config.text}</span>
    </div>
  );
}

function OrganizationDetailModal({ org, onClose }) {
  if (!org) return null;

  return (
    <div className="msl-modal-overlay" onClick={onClose}>
      <div className="msl-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="msl-modal-close" onClick={onClose}>✕</button>

        <div className="msl-modal-header">
          <h2 className="msl-modal-title">{org.name}</h2>
        </div>

        <div className="msl-modal-body">
          {org.shortDescription && (
            <div className="msl-modal-section">
              <h3 className="msl-modal-section-title">Overview</h3>
              <p className="msl-modal-text">{org.shortDescription}</p>
            </div>
          )}

          {org.description && (
            <div className="msl-modal-section">
              <h3 className="msl-modal-section-title">Details</h3>
              <p className="msl-modal-text">{org.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MiniSitesLanding({ onCreateOrganization, onSelectOrganization }) {
  const dispatch = useDispatch();
  const authToken = useSelector(s => s.auth?.token);
  const [activeTab, setActiveTab] = useState('suggested');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedOrgs, setSuggestedOrgs] = useState([]);
  const [joinedOrgs, setJoinedOrgs] = useState([]);
  const [createdOrgs, setCreatedOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [selectedOrgDetail, setSelectedOrgDetail] = useState(null);

  useEffect(() => {
    if (!authToken) return;

    if (activeTab === 'suggested' && suggestedOrgs.length === 0) {
      fetchSuggestedOrganizations();
    } else if (activeTab === 'joined' && joinedOrgs.length === 0) {
      fetchJoinedOrganizations();
    } else if (activeTab === 'mycreated' && createdOrgs.length === 0) {
      fetchUserOrganizations();
    }
  }, [activeTab, authToken]);

  const fetchSuggestedOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const data = await apiRequest('/api/organizations/suggested?limit=50', {
        token: authToken
      });
      setSuggestedOrgs(data?.data || []);
    } catch (err) {
      console.error('Failed to fetch suggested organizations:', err);
      setSuggestedOrgs([]);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const fetchJoinedOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const data = await apiRequest('/api/organizations/joined?limit=50', {
        token: authToken
      });
      setJoinedOrgs(data?.data || []);
    } catch (err) {
      console.error('Failed to fetch joined organizations:', err);
      setJoinedOrgs([]);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const fetchUserOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const response = await getOrganizations({ limit: 50 });
      setCreatedOrgs(response?.data || []);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      setCreatedOrgs([]);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleJoinOrganization = async (org) => {
    try {
      let endpoint;
      let successMessage;

      // Check visibility type
      if (org.visibility === 'private') {
        // For private orgs, send join request
        endpoint = `/api/organizations/${org.id}/join-request`;
        successMessage = '📬 Join request sent! Waiting for admin approval.';
      } else if (org.visibility === 'invite-only') {
        // For invite-only orgs, show message
        dispatch(showToast({
          message: '🔗 This organization requires an invite link to join',
          type: 'info'
        }));
        return;
      } else {
        // For public orgs, direct join
        endpoint = `/api/organizations/${org.id}/join`;
        successMessage = '✅ Successfully joined organization!';
      }

      const data = await apiRequest(endpoint, {
        method: 'POST',
        token: authToken,
        body: {}
      });

      if (data.success) {
        const joinedOrg = suggestedOrgs.find(o => o.id === org.id);
        setSuggestedOrgs(suggestedOrgs.filter(o => o.id !== org.id));
        if (joinedOrg && org.visibility === 'public') {
          // Only add to joined list if public (instant join)
          setJoinedOrgs([...joinedOrgs, joinedOrg]);
        }
        dispatch(showToast({
          message: successMessage,
          type: 'success'
        }));
      }
    } catch (err) {
      console.error('Failed to join organization:', err);
      const errorMsg = err.data?.message || 'Failed to join organization';
      dispatch(showToast({
        message: '❌ ' + errorMsg,
        type: 'error'
      }));
    }
  };

  const handleViewOrganization = async (org) => {
    try {
      // Fetch organization's mini sites
      const data = await apiRequest(`/api/organizations/${org.id}/mini-sites?status=live`, {
        token: authToken
      });

      const sites = data?.data || [];
      if (sites.length === 0) {
        dispatch(showToast({
          message: 'ℹ️ This organization has no published mini sites yet',
          type: 'info'
        }));
        return;
      }

      // Navigate to the first published mini site
      const publishedSite = sites[0];
      const siteUrl = publicSiteUrl(publishedSite.slug);
      window.location.href = siteUrl;
    } catch (err) {
      console.error('Failed to view organization:', err);
      dispatch(showToast({
        message: '❌ Failed to load organization mini site',
        type: 'error'
      }));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'suggested':
        return (
          <div className="msl-content">
            <div className="msl-search-wrap">
              <div className="msl-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="msl-search-input"
                />
              </div>
            </div>
            {loadingOrgs ? (
              <div className="msl-empty-state">Loading organizations...</div>
            ) : suggestedOrgs.length === 0 ? (
              <div className="msl-empty-state">No organizations available to join</div>
            ) : (
              <div className="msl-cards-grid">
                {suggestedOrgs.map(org => (
                  <div key={org.id} className="msl-org-card">
                    <div className="msl-card-cover">
                      <span className="msl-card-cover-text">Social Platform</span>
                    </div>
                    <div className="msl-card-content">
                      <div className="msl-org-header">
                        <div className="msl-org-info">
                          <h3 className="msl-org-name">{org.name}</h3>
                          <p className="msl-org-members">{org.memberCount || 0} members</p>
                        </div>
                      </div>
                      <p className="msl-org-description">{org.shortDescription}</p>
                      <div className="msl-card-actions">
                        <button
                          className="msl-detail-btn"
                          onClick={() => setSelectedOrgDetail(org)}
                        >
                          View Detail
                        </button>
                        <button
                          className="msl-join-btn"
                          onClick={() => handleJoinOrganization(org)}
                          title={org.visibility === 'public' ? 'Join instantly' : org.visibility === 'private' ? 'Send join request' : 'Requires invite link'}
                        >
                          {org.visibility === 'public' ? 'Join' : org.visibility === 'private' ? 'Request Join' : 'Invite Only'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'joined':
        return (
          <div className="msl-content">
            {loadingOrgs ? (
              <div className="msl-empty-state">Loading organizations...</div>
            ) : joinedOrgs.length === 0 ? (
              <div className="msl-empty-state">
                <p>You haven't joined any organizations yet</p>
              </div>
            ) : (
              <div className="msl-cards-grid">
                {joinedOrgs.map(org => (
                  <div key={org.id} className="msl-org-card">
                    <div className="msl-card-cover">
                      <span className="msl-card-cover-text">Social Platform</span>
                    </div>
                    <div className="msl-card-content">
                      <div className="msl-org-header">
                        <div className="msl-org-info">
                          <h3 className="msl-org-name">{org.name}</h3>
                          <p className="msl-org-members">{org.memberCount || 0} members</p>
                        </div>
                      </div>
                      <p className="msl-org-description">{org.shortDescription}</p>
                      <div className="msl-card-actions">
                        <button
                          className="msl-detail-btn"
                          onClick={() => setSelectedOrgDetail(org)}
                        >
                          View Detail
                        </button>
                        <button
                          className="msl-view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrganization(org);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'mycreated':
        return (
          <div className="msl-content">
            {loadingOrgs ? (
              <div className="msl-empty-state">
                Loading organizations...
              </div>
            ) : createdOrgs.length === 0 ? (
              <div className="msl-empty-state">
                <p>No organizations created yet</p>
              </div>
            ) : (
              <div className="msl-cards-grid">
                {createdOrgs.map(org => (
                  <div
                    key={org.id}
                    className={`msl-org-card ${org.status !== 'approved' ? 'msl-org-card--disabled' : ''}`}
                    onClick={() => org.status === 'approved' && onSelectOrganization?.(org)}
                  >
                    <div className="msl-card-cover" style={{
                      backgroundImage: org.coverImage ? `url(${org.coverImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      {!org.coverImage && <span className="msl-card-cover-text">Social Platform</span>}
                    </div>
                    <div className="msl-card-content">
                      <div className="msl-org-header">
                        <div className="msl-org-info">
                          <h3 className="msl-org-name">{org.name}</h3>
                          <p className="msl-org-members">{org.memberCount || 0} members</p>
                        </div>
                      </div>
                      <p className="msl-org-description">{org.shortDescription || org.description || ''}</p>
                      <button
                        className={`msl-manage-btn ${org.status !== 'approved' ? 'msl-manage-btn--disabled' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (org.status === 'approved') {
                            onSelectOrganization?.(org);
                          }
                        }}
                        disabled={org.status !== 'approved'}
                      >
                        {org.status === 'pending' ? 'Pending Admin Approval' : org.status === 'rejected' ? 'Rejected' : 'Manage'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mini-sites-landing">
      <div className="msl-header">
        <div className="msl-title-section">
          <h1 className="msl-title">Mini Sites</h1>
          <p className="msl-subtitle">Discover and manage your communities</p>
        </div>
        {activeTab === 'mycreated' && (
          <button className="msl-create-org-btn" onClick={onCreateOrganization}>
            <PlusIcon /> Create Organization
          </button>
        )}
      </div>

      <div className="msl-tabs">
        <button
          className={`msl-tab${activeTab === 'suggested' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('suggested')}
        >
          Suggested Organizations
        </button>
        <button
          className={`msl-tab${activeTab === 'joined' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          Joined Organizations
        </button>
        <button
          className={`msl-tab${activeTab === 'mycreated' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('mycreated')}
        >
          My Created
        </button>
      </div>

      {renderContent()}

      {selectedOrgDetail && (
        <OrganizationDetailModal
          org={selectedOrgDetail}
          onClose={() => setSelectedOrgDetail(null)}
        />
      )}
    </div>
  );
}
