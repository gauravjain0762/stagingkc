import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import AnimatedNav from './AnimatedNav';
import GroupsPage from './GroupsPage';
import CalendarPage from './CalendarPage';
import ImageCropper from './ImageCropper';
import { showToast } from '../../store/slices/toastSlice';
import './SiteManagementPage.css';

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}

function EditIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
}

const CATEGORIES = [
  'Technology & Software', 'Design & Creative', 'Business & Finance',
  'Education & Learning', 'Health & Wellness', 'Entertainment',
  'Sports & Fitness', 'Travel & Lifestyle',
];

function ShieldIcon2() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

function GlobeIconLg() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function LockIconLg() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

function CheckCircleIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

function ChevronDownIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}

function BackArrowIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function CreateGroupForm({ onBack, onCreateGroup }) {
  const [groupName, setGroupName] = useState('');
  const [mission, setMission] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology & Software');
  const [privacy, setPrivacy] = useState('public');
  const [adminApproval, setAdminApproval] = useState(true);
  const [minAge, setMinAge] = useState(18);
  const [coverImg, setCoverImg] = useState('');
  const [groupImg, setGroupImg] = useState('');
  const [coverCropQueue, setCoverCropQueue] = useState([]);
  const [coverCropIdx, setCoverCropIdx] = useState(0);
  const [photoCropQueue, setPhotoCropQueue] = useState([]);
  const [photoCropIdx, setPhotoCropIdx] = useState(0);
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverCropQueue([file]);
      setCoverCropIdx(0);
    }
    e.target.value = '';
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoCropQueue([file]);
      setPhotoCropIdx(0);
    }
    e.target.value = '';
  };

  const handleCoverCropComplete = (croppedFile) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverImg(ev.target?.result);
      setCoverCropQueue([]);
      setCoverCropIdx(0);
    };
    reader.readAsDataURL(croppedFile);
  };

  const handleCoverCropSkip = () => {
    if (coverCropQueue.length > 0) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCoverImg(ev.target?.result);
        setCoverCropQueue([]);
        setCoverCropIdx(0);
      };
      reader.readAsDataURL(coverCropQueue[coverCropIdx]);
    } else {
      setCoverCropQueue([]);
      setCoverCropIdx(0);
    }
  };

  const handlePhotoCropComplete = (croppedFile) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setGroupImg(ev.target?.result);
      setPhotoCropQueue([]);
      setPhotoCropIdx(0);
    };
    reader.readAsDataURL(croppedFile);
  };

  const handlePhotoCropSkip = () => {
    if (photoCropQueue.length > 0) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setGroupImg(ev.target?.result);
        setPhotoCropQueue([]);
        setPhotoCropIdx(0);
      };
      reader.readAsDataURL(photoCropQueue[photoCropIdx]);
    } else {
      setPhotoCropQueue([]);
      setPhotoCropIdx(0);
    }
  };

  const handleDeleteCoverPhoto = () => {
    setCoverImg('');
  };

  const handleCreate = () => {
    const name = groupName.trim();
    if (!name) {
      alert('⚠️ Group name is required');
      return;
    }
    if (name.length > 50) {
      alert('⚠️ Group name must be 50 characters or less');
      return;
    }
    if (mission && mission.length > 100) {
      alert('⚠️ Mission must be 100 characters or less');
      return;
    }

    try {
      onCreateGroup({
        name,
        mission,
        description,
        category,
        privacy,
        adminApproval,
        minAge: privacy === 'vetted' ? minAge : undefined,
        coverImg,
        groupImg,
      });
      alert(`✅ Group "${name}" created successfully!`);
    } catch (error) {
      alert('❌ Failed to create group. Please try again.');
      console.error('Create group error:', error);
    }
  };

  return (
    <div className="cg-page">
      {/* Cover Section */}
      <div className="cg-cover-section">
        <div className="adm-cover" style={{ background: coverImg ? `url(${coverImg})` : '#0d1424', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          {!coverImg && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <span style={{ fontSize: '24px', fontWeight: 600, color: '#94a3b8' }}>Add your cover photo here</span>
            </div>
          )}
          <button className="adm-edit-cover-btn" onClick={() => coverInputRef.current?.click()}>
            <EditIcon /> Edit Cover
          </button>
          {coverImg && (
            <button className="adm-delete-cover-btn" onClick={handleDeleteCoverPhoto} title="Delete cover photo">
              <span style={{ fontSize: '18px' }}>✕</span>
            </button>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />

          {/* Group Photo */}
          <div className="cg-photo-center">
            <div className="adm-group-photo-area">
              {groupImg ? (
                <img src={groupImg} alt="Group" className="adm-group-photo-img" />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#94a3b8', fontSize: '32px', fontWeight: 700 }}>
                  G
                </div>
              )}
              <button className="adm-edit-photo-btn" onClick={() => photoInputRef.current?.click()}>
                <EditIcon />
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="cg-content">
        <div className="cg-layout" style={{ marginTop: '56px' }}>
          {/* Left column */}
          <div className="cg-left">
            {/* Group Identity */}
            <div className="cg-section">
              <div className="cg-field">
                <label className="cg-label">Group Name</label>
                <input className="cg-input" value={groupName} onChange={e => setGroupName(e.target.value)} maxLength={50} />
                <p className="cg-hint">Keep it short and descriptive. Max 50 characters.</p>
              </div>

              <div className="cg-field">
                <label className="cg-label">Group Mission</label>
                <input className="cg-input" value={mission} onChange={e => setMission(e.target.value)} maxLength={100} />
                <p className="cg-hint">A one-line purpose statement for your group. Max 100 characters.</p>
              </div>

              <div className="cg-field">
                <label className="cg-label">Description</label>
                <textarea className="cg-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={5} />
              </div>

              <div className="cg-field">
                <label className="cg-label">Category</label>
                <div className="cg-select-wrap">
                  <select className="cg-select" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="cg-chevron"><ChevronDownIcon /></span>
                </div>
              </div>
            </div>

            {/* Privacy & Access */}
            <div className="cg-section">
              <div className="cg-section-head"><ShieldIcon2 /> Privacy & Access</div>

              <div className="cg-privacy-grid">
                {/* Public */}
                <div className={`cg-privacy-card${privacy === 'public' ? ' cg-privacy-card--active' : ''}`} onClick={() => setPrivacy('public')}>
                  <div className="cg-privacy-card-top">
                    <span className={`cg-privacy-icon${privacy === 'public' ? ' active' : ''}`}><GlobeIconLg /></span>
                    <span className={`cg-radio${privacy === 'public' ? ' cg-radio--on' : ''}`}>
                      {privacy === 'public' && <span className="cg-radio-dot" />}
                    </span>
                  </div>
                  <p className="cg-privacy-title">Public Group</p>
                  <p className="cg-privacy-desc">Anyone can see who's in the group and what they post.</p>
                </div>
                {/* Private */}
                <div className={`cg-privacy-card${privacy === 'private' ? ' cg-privacy-card--active' : ''}`} onClick={() => setPrivacy('private')}>
                  <div className="cg-privacy-card-top">
                    <span className={`cg-privacy-icon${privacy === 'private' ? ' active' : ''}`}><LockIconLg /></span>
                    <span className={`cg-radio${privacy === 'private' ? ' cg-radio--on' : ''}`}>
                      {privacy === 'private' && <span className="cg-radio-dot" />}
                    </span>
                  </div>
                  <p className="cg-privacy-title">Private Group</p>
                  <p className="cg-privacy-desc">Only members can see who's in the group and what they post.</p>
                </div>
                {/* Vetted */}
                <div className={`cg-privacy-card${privacy === 'vetted' ? ' cg-privacy-card--active' : ''}`} onClick={() => setPrivacy('vetted')}>
                  <div className="cg-privacy-card-top">
                    <span className={`cg-privacy-icon${privacy === 'vetted' ? ' active' : ''}`}><CheckCircleIcon /></span>
                    <span className={`cg-radio${privacy === 'vetted' ? ' cg-radio--on' : ''}`}>
                      {privacy === 'vetted' && <span className="cg-radio-dot" />}
                    </span>
                  </div>
                  <p className="cg-privacy-title">Vetted Group</p>
                  <p className="cg-privacy-desc">Verified members only. Requires admin approval to join.</p>
                </div>
              </div>

              {/* Admin Approval */}
              {(privacy === 'private' || privacy === 'vetted') && (
              <div className="cg-toggle-row">
                <div className="cg-toggle-icon"><ShieldIcon2 /></div>
                <div className="cg-toggle-info">
                  <p className="cg-toggle-title">Admin Approval</p>
                  <p className="cg-toggle-desc">Require admins to approve new member requests.</p>
                </div>
                <div className={`cg-toggle${adminApproval ? ' cg-toggle--on' : ''}`} onClick={() => setAdminApproval(v => !v)}>
                  <div className="cg-toggle-thumb" />
                </div>
              </div>
              )}

              {/* Age Verification */}
              {privacy === 'vetted' && (
              <div className="cg-age-verification">
                <div className="cg-age-header">
                  <p className="cg-age-title">Age Verification</p>
                  <p className="cg-age-desc">Set minimum age requirement for group members</p>
                </div>
                <div className="cg-age-input-row">
                  <input
                    type="number"
                    min="13"
                    max="120"
                    value={minAge}
                    onChange={(e) => setMinAge(Math.max(13, parseInt(e.target.value) || 13))}
                    className="cg-age-input"
                    placeholder="18"
                  />
                  <span className="cg-age-suffix">years old</span>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="cg-form-actions">
          <button className="cg-cancel-btn" onClick={onBack}>Cancel</button>
          <button className="cg-create-btn" onClick={handleCreate} disabled={!groupName.trim()}>
            Create Group
          </button>
        </div>
      </div>

      {/* Cover Image Cropper */}
      {coverCropQueue.length > 0 && (
        <ImageCropper
          key={`cover-${coverCropIdx}`}
          file={coverCropQueue[coverCropIdx]}
          onSave={handleCoverCropComplete}
          onSkip={handleCoverCropSkip}
          onCancel={() => { setCoverCropQueue([]); setCoverCropIdx(0); }}
          defaultAspect="landscape"
          cropShape="rect"
        />
      )}

      {/* Photo Image Cropper */}
      {photoCropQueue.length > 0 && (
        <ImageCropper
          key={`photo-${photoCropIdx}`}
          file={photoCropQueue[photoCropIdx]}
          onSave={handlePhotoCropComplete}
          onSkip={handlePhotoCropSkip}
          onCancel={() => { setPhotoCropQueue([]); setPhotoCropIdx(0); }}
          defaultAspect="square"
          cropShape="round"
        />
      )}
    </div>
  );
}

function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function CalendarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

export default function SiteManagementPage({ site, onBack, avatarUrl }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('groups');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [createdGroups, setCreatedGroups] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);

  useEffect(() => {
    // Load created groups from localStorage
    const stored = localStorage.getItem(`minisite_groups_${site?.id || 'default'}`);
    if (stored) {
      try {
        setCreatedGroups(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored groups:', e);
      }
    }
  }, [site?.id]);

  const handleCreateGroupClick = () => {
    setShowCreateGroup(true);
  };

  const handleCreateGroup = (groupData) => {
    if (editingGroupId) {
      // Update existing group
      const updated = createdGroups.map(g =>
        g.id === editingGroupId ? { ...g, ...groupData, updatedAt: new Date().toISOString() } : g
      );
      setCreatedGroups(updated);
      localStorage.setItem(`minisite_groups_${site?.id || 'default'}`, JSON.stringify(updated));
      setEditingGroupId(null);
    } else {
      // Create new group
      const newGroup = {
        id: Date.now().toString(),
        ...groupData,
        createdAt: new Date().toISOString(),
      };
      const updated = [...createdGroups, newGroup];
      setCreatedGroups(updated);
      localStorage.setItem(`minisite_groups_${site?.id || 'default'}`, JSON.stringify(updated));
    }
    setShowCreateGroup(false);
  };

  const handleEditGroup = (groupId) => {
    setEditingGroupId(groupId);
    setShowCreateGroup(true);
  };

  const handleDeleteGroup = (groupId) => {
    const updated = createdGroups.filter(g => g.id !== groupId);
    setCreatedGroups(updated);
    localStorage.setItem(`minisite_groups_${site?.id || 'default'}`, JSON.stringify(updated));
  };

  const handlePublishGroup = (groupId) => {
    const updated = createdGroups.map(g =>
      g.id === groupId ? { ...g, isPublished: true, publishedAt: new Date().toISOString() } : g
    );
    setCreatedGroups(updated);
    localStorage.setItem(`minisite_groups_${site?.id || 'default'}`, JSON.stringify(updated));
    dispatch(showToast({
      message: 'Group published successfully!',
      type: 'success',
      duration: 3000
    }));
  };

  const handleUnpublishGroup = (groupId) => {
    const updated = createdGroups.map(g =>
      g.id === groupId ? { ...g, isPublished: false } : g
    );
    setCreatedGroups(updated);
    localStorage.setItem(`minisite_groups_${site?.id || 'default'}`, JSON.stringify(updated));
    dispatch(showToast({
      message: 'Group unpublished',
      type: 'info',
      duration: 2500
    }));
  };

  if (!site) {
    return (
      <div className="smp-page">
        <div className="smp-container">
          <button onClick={onBack} className="smp-back-btn">
            <BackIcon /> Back
          </button>
          <p>No site selected</p>
        </div>
      </div>
    );
  }

  const handleNavigation = (id) => {
    if (id === 'home') onBack();
  };

  // Sanitize site name for URL (remove special characters)
  const sanitizeSiteName = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '');
  };

  const cleanSiteName = sanitizeSiteName(site?.name || '');
  const liveUrl = `${window.location.origin}/?site=${cleanSiteName}`;

  // Render different sections based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'groups':
        if (showCreateGroup) {
          return <CreateGroupForm onBack={() => setShowCreateGroup(false)} onCreateGroup={handleCreateGroup} />;
        }
        return (
          <div className="smp-groups-container">
            {/* Groups Header with Tabs and Create Button */}
            <div className="smp-groups-header">
              <div className="smp-groups-tabs">
                <div className="smp-tab smp-tab--active">My Created Groups</div>
              </div>
              <button className="smp-create-group-btn-header" onClick={handleCreateGroupClick}>+ Create Group</button>
            </div>

            {/* Groups Content */}
            <div className="smp-groups-content">
              {createdGroups.length === 0 ? (
                <div className="smp-empty-state">
                  <p>No groups created yet. Click "Create Group" to get started.</p>
                </div>
              ) : (
                <div className="smp-groups-grid">
                  {createdGroups.map(group => (
                    <div key={group.id} className="smp-group-card">
                      <div className="smp-group-cover" style={{ backgroundImage: group.coverImg ? `url(${group.coverImg})` : '', background: group.coverImg ? `url(${group.coverImg})` : `linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div className="smp-group-photo">
                        {group.groupImg ? (
                          <img src={group.groupImg} alt={group.name} className="smp-group-photo-img" />
                        ) : (
                          <span className="smp-group-photo-text">G</span>
                        )}
                      </div>
                      <div className="smp-group-info">
                        <h4>{group.name}</h4>
                        <p>{group.mission || 'No mission'}</p>
                        <span className="smp-group-category">{group.category}</span>
                      </div>
                      <div className="smp-group-actions">
                        <button className="smp-group-btn smp-group-btn-edit" onClick={() => handleEditGroup(group.id)} title="Edit">Edit</button>
                        <button className="smp-group-btn smp-group-btn-delete" onClick={() => handleDeleteGroup(group.id)} title="Delete">Delete</button>
                        {!group.isPublished ? (
                          <button className="smp-group-btn smp-group-btn-publish" onClick={() => handlePublishGroup(group.id)} title="Publish group">Publish</button>
                        ) : (
                          <button className="smp-group-btn smp-group-btn-unpublish" onClick={() => handleUnpublishGroup(group.id)} title="Unpublish group">Unpublish</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'calendar':
        return <CalendarPage onBack={() => setActiveTab('dashboard')} hideNav={true} />;
      case 'dashboard':
      default:
        return (
          <div className="smp-dashboard">
            <h2>Dashboard</h2>
            <div className="smp-stats-grid">
              <div className="smp-stat-box">
                <div className="smp-stat-content">
                  <div className="smp-stat-number">5</div>
                  <div className="smp-stat-label">Created Groups</div>
                </div>
              </div>
              <div className="smp-stat-box">
                <div className="smp-stat-content">
                  <div className="smp-stat-number">12</div>
                  <div className="smp-stat-label">Created Events</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="smp-page">
      <AnimatedNav activeId="minisites" avatarUrl={avatarUrl} onNavigate={handleNavigation} />

      {/* Sidebar Navigation */}
      <div className="smp-sidebar">
        <button onClick={onBack} className="smp-sidebar-close-btn" title="Close">
          <CloseIcon />
        </button>
        <nav className="smp-nav">
          <button
            className={`smp-nav-item ${activeTab === 'groups' ? 'smp-nav-item--active' : ''}`}
            onClick={() => setActiveTab('groups')}
            title="Groups"
          >
            <UsersIcon /> Groups
          </button>
          <button
            className={`smp-nav-item ${activeTab === 'calendar' ? 'smp-nav-item--active' : ''}`}
            onClick={() => setActiveTab('calendar')}
            title="Calendar"
          >
            <CalendarIcon /> Calendar
          </button>
        </nav>
      </div>

      <div className="smp-container">
        {/* Site Title */}
        <div className="smp-site-title">
          <h2>Site Name: {site.name}</h2>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="smp-site-url"
          >
            Live URL: {liveUrl}
          </a>
        </div>

        {/* Main Content */}
        <div className="smp-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
