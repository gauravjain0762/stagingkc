import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getOrganizations } from '../../services/organizationApi';
import { apiRequest } from '../../services/api';
import { showToast } from '../../store/slices/toastSlice';
import { publicSiteUrl } from './miniSiteUtils';
import './MiniSitesLanding.css';

function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function GlobeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function LockIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
}

function KeyIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0L19 4m-3.5 3.5L18 10"/></svg>;
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

function OrganizationDetailModal({ org, onClose, onJoin, authToken }) {
  const [fullOrgData, setFullOrgData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!org || !authToken) return;

    const fetchOrgDetails = async () => {
      setLoading(true);
      try {
        const data = await apiRequest(`/api/organizations/${org.id}`, {
          token: authToken
        });
        setFullOrgData(data?.data);
      } catch (err) {
        console.error('Failed to fetch organization details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgDetails();
  }, [org, authToken]);

  if (!org) return null;
  const displayData = fullOrgData || org;

  return (
    <div className="msl-modal-overlay" onClick={onClose}>
      <div className="msl-modal-content msl-modal-content--large" onClick={(e) => e.stopPropagation()}>
        <button className="msl-modal-close" onClick={onClose}>✕</button>

        {/* Cover Image */}
        {displayData.coverImage && (
          <div className="msl-modal-cover">
            <img src={displayData.coverImage} alt="Cover" />
          </div>
        )}

        <div className="msl-modal-header">
          <div className="msl-modal-header-content">
            {displayData.logo && (
              <img src={displayData.logo} alt="Logo" className="msl-modal-logo" />
            )}
            <div>
              <h2 className="msl-modal-title">{displayData.name}</h2>
              <p className="msl-modal-meta">{displayData.memberCount || 0} member{(displayData.memberCount || 0) !== 1 ? 's' : ''} • {displayData.miniSitesCount || 0} site{(displayData.miniSitesCount || 0) !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="msl-modal-body">
            <p className="msl-modal-text">Loading details...</p>
          </div>
        ) : (
          <div className="msl-modal-body">
            {displayData.shortDescription && (
              <div className="msl-modal-section">
                <h3 className="msl-modal-section-title">Overview</h3>
                <p className="msl-modal-text">{displayData.shortDescription}</p>
              </div>
            )}

            {displayData.fullDescription && (
              <div className="msl-modal-section">
                <h3 className="msl-modal-section-title">Description</h3>
                <p className="msl-modal-text">{displayData.fullDescription}</p>
              </div>
            )}

            <div className="msl-modal-footer">
              {displayData.visibility === 'public' ? (
                <button className="msl-modal-btn msl-modal-btn--primary" onClick={() => onJoin(displayData)}>
                  Join Organization
                </button>
              ) : displayData.visibility === 'private' ? (
                <button className="msl-modal-btn msl-modal-btn--primary" onClick={() => onJoin(displayData)}>
                  Send Join Request
                </button>
              ) : (
                <div className="msl-modal-message">
                  ⛓️ This organization is invite-only. You need an invite link to join.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MiniSitesLanding({ onCreateOrganization, onSelectOrganization }) {
  const dispatch = useDispatch();
  const authToken = useSelector(s => s.auth?.token);
  const [activeTab, setActiveTab] = useState('suggested');
  const [searchTerm, setSearchTerm] = useState('');
  const [joinedSearch, setJoinedSearch] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [createdSearch, setCreatedSearch] = useState('');
  const [suggestedOrgs, setSuggestedOrgs] = useState([]);
  const [joinedOrgs, setJoinedOrgs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [createdOrgs, setCreatedOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [selectedOrgDetail, setSelectedOrgDetail] = useState(null);

  useEffect(() => {
    if (!authToken) return;

    if (activeTab === 'suggested' && suggestedOrgs.length === 0) {
      fetchSuggestedOrganizations();
    } else if (activeTab === 'joined' && joinedOrgs.length === 0) {
      fetchJoinedOrganizations();
    } else if (activeTab === 'pending' && pendingRequests.length === 0) {
      fetchPendingRequests();
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

  const fetchPendingRequests = async () => {
    setLoadingOrgs(true);
    try {
      const data = await apiRequest('/api/organizations/pending-requests?limit=50', {
        token: authToken
      });
      setPendingRequests(data?.data || []);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
      setPendingRequests([]);
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
        const foundOrg = suggestedOrgs.find(o => o.id === org.id);
        setSuggestedOrgs(suggestedOrgs.filter(o => o.id !== org.id));

        if (foundOrg) {
          if (org.visibility === 'public') {
            // Public org: add to joined list immediately
            setJoinedOrgs([...joinedOrgs, foundOrg]);
          } else if (org.visibility === 'private') {
            // Private org: add to pending requests (waiting for admin approval)
            setPendingRequests([...pendingRequests, foundOrg]);
          }
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
                          <p className="msl-org-members">{org.memberCount || 0} member{(org.memberCount || 0) !== 1 ? 's' : ''}</p>
                        </div>
                        <div className={`msl-visibility-badge msl-visibility-${org.visibility || 'public'}`}>
                          {org.visibility === 'private' ? (
                            <><LockIcon /> Private</>
                          ) : org.visibility === 'invite-only' ? (
                            <><KeyIcon /> Invite</>
                          ) : (
                            <><GlobeIcon /> Public</>
                          )}
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
        const filteredJoinedOrgs = joinedOrgs.filter(org =>
          org.name.toLowerCase().includes(joinedSearch.toLowerCase()) ||
          org.shortDescription?.toLowerCase().includes(joinedSearch.toLowerCase())
        );
        return (
          <div className="msl-content">
            <div className="msl-search-wrap">
              <div className="msl-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search joined organizations..."
                  value={joinedSearch}
                  onChange={(e) => setJoinedSearch(e.target.value)}
                  className="msl-search-input"
                />
              </div>
            </div>
            {loadingOrgs ? (
              <div className="msl-empty-state">Loading organizations...</div>
            ) : filteredJoinedOrgs.length === 0 ? (
              <div className="msl-empty-state">
                <p>{joinedOrgs.length === 0 ? "You haven't joined any organizations yet" : 'No organizations found'}</p>
              </div>
            ) : (
              <div className="msl-cards-grid">
                {filteredJoinedOrgs.map(org => (
                  <div key={org.id} className="msl-org-card">
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
                          <p className="msl-org-members">{org.memberCount || 0} member{(org.memberCount || 0) !== 1 ? 's' : ''}</p>
                        </div>
                        <div className={`msl-visibility-badge msl-visibility-${org.visibility || 'public'}`}>
                          {org.visibility === 'private' ? (
                            <><LockIcon /> Private</>
                          ) : org.visibility === 'invite-only' ? (
                            <><KeyIcon /> Invite</>
                          ) : (
                            <><GlobeIcon /> Public</>
                          )}
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

      case 'pending':
        const filteredPendingReqs = pendingRequests.filter(org =>
          org.name.toLowerCase().includes(pendingSearch.toLowerCase()) ||
          org.shortDescription?.toLowerCase().includes(pendingSearch.toLowerCase())
        );
        return (
          <div className="msl-content">
            <div className="msl-search-wrap">
              <div className="msl-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search pending requests..."
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="msl-search-input"
                />
              </div>
            </div>
            {loadingOrgs ? (
              <div className="msl-empty-state">Loading pending requests...</div>
            ) : filteredPendingReqs.length === 0 ? (
              <div className="msl-empty-state">
                <p>{pendingRequests.length === 0 ? "You have no pending join requests" : 'No pending requests found'}</p>
              </div>
            ) : (
              <div className="msl-cards-grid">
                {filteredPendingReqs.map(org => (
                  <div key={org.id} className="msl-org-card">
                    <div className="msl-card-cover" style={{
                      backgroundImage: org.coverImage ? `url(${org.coverImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      {!org.coverImage && <span className="msl-card-cover-text">Social Platform</span>}
                    </div>
                    <div className="msl-card-content">
                      <div className="msl-pending-alert">⚠️ Approval pending by admin</div>
                      <div className="msl-org-header">
                        <div className="msl-org-info">
                          <h3 className="msl-org-name">{org.name}</h3>
                          <p className="msl-org-members">{org.memberCount || 0} member{(org.memberCount || 0) !== 1 ? 's' : ''}</p>
                        </div>
                        <div className={`msl-visibility-badge msl-visibility-${org.visibility || 'public'}`}>
                          {org.visibility === 'private' ? (
                            <><LockIcon /> Private</>
                          ) : org.visibility === 'invite-only' ? (
                            <><KeyIcon /> Invite</>
                          ) : (
                            <><GlobeIcon /> Public</>
                          )}
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
                          className="msl-detail-btn"
                          onClick={() => {
                            setPendingRequests(pendingRequests.filter(o => o.id !== org.id));
                            setSuggestedOrgs([...suggestedOrgs, org]);
                            dispatch(showToast({
                              message: 'Join request deleted',
                              type: 'info'
                            }));
                          }}
                        >
                          Delete Request
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
        const filteredCreatedOrgs = createdOrgs.filter(org =>
          org.name.toLowerCase().includes(createdSearch.toLowerCase()) ||
          org.shortDescription?.toLowerCase().includes(createdSearch.toLowerCase()) ||
          org.description?.toLowerCase().includes(createdSearch.toLowerCase())
        );
        return (
          <div className="msl-content">
            <div className="msl-search-wrap">
              <div className="msl-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search created organizations..."
                  value={createdSearch}
                  onChange={(e) => setCreatedSearch(e.target.value)}
                  className="msl-search-input"
                />
              </div>
            </div>
            {loadingOrgs ? (
              <div className="msl-empty-state">
                Loading organizations...
              </div>
            ) : filteredCreatedOrgs.length === 0 ? (
              <div className="msl-empty-state">
                <p>{createdOrgs.length === 0 ? "No organizations created yet" : 'No organizations found'}</p>
              </div>
            ) : (
              <div className="msl-cards-grid">
                {filteredCreatedOrgs.map(org => (
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
                          <p className="msl-org-members">{org.memberCount || 0} member{(org.memberCount || 0) !== 1 ? 's' : ''}</p>
                        </div>
                        <div className={`msl-visibility-badge msl-visibility-${org.visibility || 'public'}`}>
                          {org.visibility === 'private' ? (
                            <><LockIcon /> Private</>
                          ) : org.visibility === 'invite-only' ? (
                            <><KeyIcon /> Invite</>
                          ) : (
                            <><GlobeIcon /> Public</>
                          )}
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
          className={`msl-tab${activeTab === 'pending' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
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
          onJoin={handleJoinOrganization}
          authToken={authToken}
        />
      )}
    </div>
  );
}
