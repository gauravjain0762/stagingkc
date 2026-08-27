import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateProfile, updateEducation, updateAvatar, updateCover } from '../../store/slices/profileSlice';
import { consumeJustSelectedPlan } from '../../store/slices/plansSlice';
import { showToast } from '../../store/slices/toastSlice';
import SkeletonImg from '../SkeletonImg';
import ImageCropper from './ImageCropper';
import './ProfilePage.css';
import './OnboardingForm.css';

const STEPS = [
  { n: 1, label: 'Photo' },
  { n: 2, label: 'Profile Info' },
  { n: 3, label: 'Education' },
];

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatDob(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const COUNTRY_CODES = [
  { code: '+91',  country: 'India' },
  { code: '+1',   country: 'US/Canada' },
  { code: '+44',  country: 'UK' },
  { code: '+61',  country: 'Australia' },
  { code: '+81',  country: 'Japan' },
  { code: '+86',  country: 'China' },
  { code: '+49',  country: 'Germany' },
  { code: '+33',  country: 'France' },
  { code: '+39',  country: 'Italy' },
  { code: '+34',  country: 'Spain' },
  { code: '+7',   country: 'Russia' },
  { code: '+55',  country: 'Brazil' },
  { code: '+52',  country: 'Mexico' },
  { code: '+82',  country: 'South Korea' },
  { code: '+65',  country: 'Singapore' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+92',  country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+94',  country: 'Sri Lanka' },
  { code: '+27',  country: 'South Africa' },
  { code: '+234', country: 'Nigeria' },
  { code: '+20',  country: 'Egypt' },
  { code: '+64',  country: 'New Zealand' },
  { code: '+31',  country: 'Netherlands' },
  { code: '+46',  country: 'Sweden' },
  { code: '+41',  country: 'Switzerland' },
  { code: '+353', country: 'Ireland' },
  { code: '+63',  country: 'Philippines' },
  { code: '+62',  country: 'Indonesia' },
  { code: '+60',  country: 'Malaysia' },
  { code: '+66',  country: 'Thailand' },
  { code: '+84',  country: 'Vietnam' },
  { code: '+90',  country: 'Turkey' },
  { code: '+972', country: 'Israel' },
  { code: '+48',  country: 'Poland' },
  { code: '+351', country: 'Portugal' },
  { code: '+45',  country: 'Denmark' },
  { code: '+47',  country: 'Norway' },
];

// Splits a stored "+<code><number>" phone into its select/input parts.
function splitPhone(raw) {
  const trimmed = String(raw ?? '').trim();
  if (trimmed.startsWith('+')) {
    const match = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)
      .find(c => trimmed.startsWith(c.code));
    if (match) return { phoneCode: match.code, phone: trimmed.slice(match.code.length).trim() };
  }
  return { phoneCode: '+91', phone: trimmed };
}

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function ImagePlaceholderIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
}

function newEdu() {
  return { id: `new_${Date.now()}`, school: '', degree: '', years: '', type: 'University' };
}

const Req = () => <span className="ob-req">*</span>;

// Collapsed trigger shows just the dial code ("+91"); the open list still
// shows the country name so it stays identifiable while picking.
function PhoneCodeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [opensUp, setOpensUp] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Opens downward by default, which cuts it off when the field sits near the
  // bottom of the viewport (e.g. deep in a long onboarding form) — flip
  // upward when there isn't room below, and cap its height either way so it
  // scrolls internally instead of rendering past the fold.
  useLayoutEffect(() => {
    if (!open) return;
    const wrap = ref.current;
    const list = listRef.current;
    if (!wrap || !list) return;
    const MARGIN = 12;
    const wrapRect = wrap.getBoundingClientRect();
    const spaceBelow = window.innerHeight - wrapRect.bottom - MARGIN;
    const spaceAbove = wrapRect.top - MARGIN;
    const up = list.scrollHeight > spaceBelow && spaceAbove > spaceBelow;
    setOpensUp(up);
    list.style.maxHeight = `${Math.max(up ? spaceAbove : spaceBelow, 120)}px`;
  }, [open]);

  return (
    <div className="ob-phone-code-select" ref={ref}>
      <button
        type="button"
        className={`ob-phone-code-trigger${open ? ' ob-phone-code-trigger--open' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <span>{value}</span>
        <Chevron />
      </button>
      {open && (
        <div className={`ob-phone-code-list${opensUp ? ' ob-phone-code-list--up' : ''}`} ref={listRef}>
          {COUNTRY_CODES.map(c => (
            <button
              key={c.code + c.country}
              type="button"
              className={`ob-phone-code-opt${c.code === value ? ' ob-phone-code-opt--sel' : ''}`}
              onClick={() => { onChange(c.code); setOpen(false); }}
            >
              <span className="ob-phone-code-opt-code">{c.code}</span>
              <span className="ob-phone-code-opt-country">{c.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Generic hand-rolled dropdown — replaces native <select> so the open menu
// matches this app's dark theme instead of the OS/browser popup.
function CustomSelect({ value, onChange, options, placeholder = 'Select', hasError }) {
  const [open, setOpen] = useState(false);
  const [opensUp, setOpensUp] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Same flip-upward-when-cramped behavior as PhoneCodeSelect above.
  useLayoutEffect(() => {
    if (!open) return;
    const wrap = ref.current;
    const list = listRef.current;
    if (!wrap || !list) return;
    const MARGIN = 12;
    const wrapRect = wrap.getBoundingClientRect();
    const spaceBelow = window.innerHeight - wrapRect.bottom - MARGIN;
    const spaceAbove = wrapRect.top - MARGIN;
    const up = list.scrollHeight > spaceBelow && spaceAbove > spaceBelow;
    setOpensUp(up);
    list.style.maxHeight = `${Math.max(up ? spaceAbove : spaceBelow, 120)}px`;
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div className="ob-custom-select" ref={ref}>
      <button
        type="button"
        className={`ob-custom-select-trigger${open ? ' ob-custom-select-trigger--open' : ''}${hasError ? ' ob-input--error' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <span className={selected ? '' : 'ob-custom-select-placeholder'}>{selected ? selected.label : placeholder}</span>
        <Chevron />
      </button>
      {open && (
        <div className={`ob-custom-select-list${opensUp ? ' ob-custom-select-list--up' : ''}`} ref={listRef}>
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              className={`ob-custom-select-opt${o.value === value ? ' ob-custom-select-opt--sel' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OnboardingForm() {
  const dispatch = useDispatch();
  const { profile } = useSelector(s => s.profile);
  const { user: authUser } = useSelector(s => s.auth);

  const [step,   setStep]   = useState(1);
  const [bio,    setBio]    = useState('');
  const [form,   setForm]   = useState({ name: '', dob: '', gender: '', status: '', location: '', phoneCode: '+91', phone: '', website: '' });
  const [edu,    setEdu]    = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Step 1 — photo/cover (same upload mechanism as ProfilePage's AboutTab).
  const [localAvatarUrl, setLocalAvatarUrl] = useState(null);
  const [localCoverUrl,  setLocalCoverUrl]  = useState(null);
  const [cropTarget,     setCropTarget]     = useState(null); // { file, kind: 'avatar' | 'cover' } | null
  const coverInputRef  = useRef(null);
  const avatarInputRef = useRef(null);

  const email = profile?.email ?? authUser?.email ?? '';
  const displayAvatar = localAvatarUrl ?? profile?.avatar ?? authUser?.avatar ?? null;
  const displayCover  = localCoverUrl  ?? profile?.coverPhoto ?? null;

  function applyCroppedImage(croppedFile) {
    if (!cropTarget) return;
    if (cropTarget.kind === 'cover') {
      setLocalCoverUrl(URL.createObjectURL(croppedFile));
      dispatch(updateCover(croppedFile));
    } else {
      setLocalAvatarUrl(URL.createObjectURL(croppedFile));
      dispatch(updateAvatar(croppedFile));
    }
    setCropTarget(null);
  }

  useEffect(() => { dispatch(fetchUserProfile()); }, [dispatch]);

  // Seed any fields the user already has (e.g. name from signup).
  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio ?? '');
    setForm({
      name:     profile.fullName ?? authUser?.fullName ?? '',
      dob:      profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
      gender:   profile.gender ?? '',
      status:   profile.relationshipStatus ?? '',
      location: profile.location ?? '',
      ...splitPhone(profile.phone),
      website:  profile.website ?? '',
    });
    if (Array.isArray(profile.education) && profile.education.length) {
      setEdu(profile.education.map(e => ({ id: e._id ?? e.id ?? `e_${Math.random()}`, school: e.school ?? '', degree: e.degree ?? '', years: e.years ?? '', type: e.type ?? 'University' })));
    }
  }, [profile, authUser]);

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: false })); };

  function validateProfileStep() {
    const errs = {};
    if (!form.gender)          errs.gender = true;
    if (!form.location.trim()) errs.location = true;
    if (Object.keys(errs).length) {
      setErrors(errs);
      dispatch(showToast({ message: 'Fields * are mandatory.', type: 'error' }));
      return false;
    }
    setErrors({});
    return true;
  }

  function goNext() {
    if (step === 2 && !validateProfileStep()) return;
    setStep(s => Math.min(3, s + 1));
  }

  async function handleSave() {
    if (!validateProfileStep()) {
      setStep(2);
      return;
    }

    setSaving(true);
    try {
      const res = await dispatch(updateProfile({
        bio,
        fullName:           form.name.trim(),
        dateOfBirth:        form.dob || undefined,
        gender:             form.gender,
        relationshipStatus: form.status,
        location:           form.location.trim(),
        phone:              form.phone.trim() ? `${form.phoneCode}${form.phone.trim()}` : '',
        website:            form.website,
      }));
      // Don't advance to the feed if the save failed (toastSlice shows the error).
      if (updateProfile.rejected.match(res)) return;
      const cleanEdu = edu.filter(e => e.school.trim() || e.degree.trim());
      if (cleanEdu.length) await dispatch(updateEducation(cleanEdu));
      dispatch(consumeJustSelectedPlan()); // → App renders HomePage (feed)
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ob-page">
      <div className="ob-card">
        <div className="ob-header">
          <h1 className="ob-title">Complete your profile</h1>
          <p className="ob-subtitle">Tell us a bit about yourself to get started.</p>
        </div>

        <div className="ob-steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="ob-step-item">
              <button
                type="button"
                className={`ob-step${step === s.n ? ' ob-step--active' : ''}${step > s.n ? ' ob-step--done' : ''}`}
                onClick={() => setStep(s.n)}
              >
                <span className="ob-step-num">{step > s.n ? '✓' : s.n}</span>
                <span className="ob-step-label">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className={`ob-step-line${step > s.n ? ' ob-step-line--done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Photo & Cover Photo (optional) */}
        {step === 1 && (
          <section className="ob-section">
            <h2 className="ob-section-title">Profile Photo &amp; Cover Photo</h2>
            <p className="ob-subtitle" style={{ marginBottom: 16 }}>Optional — you can always add or change these later from your profile.</p>

            <div className="prof-cover" style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
              {displayCover
                ? <SkeletonImg src={displayCover} alt="cover" className="prof-cover-img" />
                : (
                  <button type="button" className="prof-cover-placeholder" onClick={() => coverInputRef.current?.click()} title="Add a cover photo">
                    <ImagePlaceholderIcon />
                    <span>Add a cover photo</span>
                  </button>
                )}
              <button type="button" className="prof-cover-edit-btn" onClick={() => coverInputRef.current?.click()} title="Change cover photo">
                <EditIcon /><span>{displayCover ? 'Change Cover' : 'Upload Cover'}</span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setCropTarget({ file, kind: 'cover' });
                  e.target.value = '';
                }}
              />
            </div>

            <div className="prof-avatar-wrap" style={{ position: 'relative', overflow: 'hidden', marginTop: -70, marginLeft: 'auto', marginRight: 'auto' }}>
              {displayAvatar
                ? <SkeletonImg src={displayAvatar} alt={form.name || 'Profile'} className="prof-avatar-img" />
                : (
                  <div className="prof-avatar-img ob-avatar-fallback">
                    {(form.name || '?').trim().charAt(0).toUpperCase()}
                  </div>
                )}
              <button type="button" className="prof-avatar-edit-btn" onClick={() => avatarInputRef.current?.click()} title="Change profile photo">
                <EditIcon />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setCropTarget({ file, kind: 'avatar' });
                  e.target.value = '';
                }}
              />
            </div>
          </section>
        )}

        {/* Step 2 — Overview + Personal Information */}
        {step === 2 && (
        <>
        <section className="ob-section">
          <h2 className="ob-section-title">Overview</h2>
          <textarea
            className="about-bio-textarea"
            placeholder="Write a short bio about yourself"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
          />
        </section>

        {/* Personal Information */}
        <section className="ob-section">
          <h2 className="ob-section-title">Personal Information</h2>
          <div className="ob-grid">
            <div className="ob-field">
              <label className="ob-label">Full Name</label>
              <input
                className="about-info-row-input"
                value={form.name}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="ob-field">
              <label className="ob-label">Date of Birth</label>
              <input
                className="about-info-row-input"
                value={formatDob(form.dob)}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="ob-field">
              <label className="ob-label">Gender <Req /></label>
              <CustomSelect
                value={form.gender}
                onChange={v => setField('gender', v)}
                placeholder="Select gender"
                hasError={errors.gender}
                options={[
                  { value: 'Male',   label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other',  label: 'Other' },
                ]}
              />
            </div>

            <div className="ob-field">
              <label className="ob-label">Relationship Status</label>
              <CustomSelect
                value={form.status}
                onChange={v => setField('status', v)}
                placeholder="Select status"
                options={[
                  { value: 'Single',              label: 'Single' },
                  { value: 'In a relationship',    label: 'In a relationship' },
                  { value: 'Married',              label: 'Married' },
                  { value: "It's complicated",     label: "It's complicated" },
                ]}
              />
            </div>

            <div className="ob-field">
              <label className="ob-label">Location <Req /></label>
              <input
                className={`about-info-row-input${errors.location ? ' ob-input--error' : ''}`}
                value={form.location}
                placeholder="City, Country"
                onChange={e => setField('location', e.target.value)}
              />
            </div>

            <div className="ob-field">
              <label className="ob-label">Email</label>
              <input className="about-info-row-input" value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>

            <div className="ob-field">
              <label className="ob-label">Phone</label>
              <div className="ob-phone-row">
                <PhoneCodeSelect value={form.phoneCode} onChange={v => setField('phoneCode', v)} />
                <input
                  className="about-info-row-input ob-phone-input"
                  type="tel"
                  value={form.phone}
                  placeholder="Phone number"
                  onChange={e => setField('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="ob-field">
              <label className="ob-label">Website</label>
              <input className="about-info-row-input" value={form.website} placeholder="https://" onChange={e => setField('website', e.target.value)} />
            </div>
          </div>
        </section>
        </>
        )}

        {/* Step 3 — Education (optional) */}
        {step === 3 && (
        <section className="ob-section">
          <h2 className="ob-section-title">Education</h2>
          <p className="ob-subtitle" style={{ marginBottom: 16 }}>Optional — add as many entries as you like, or skip this.</p>
          <div className="about-edu-edit-list">
            {edu.map((item, idx) => (
              <div key={item.id ?? idx} className="about-edu-edit-card">
                <div className="about-edu-edit-card-header">
                  <span className="about-edu-edit-card-num">Education {idx + 1}</span>
                  <button className="about-edu-remove-btn" type="button" title="Remove" onClick={() => setEdu(d => d.filter((_, i) => i !== idx))}><TrashIcon /></button>
                </div>
                <div className="about-edu-edit-grid">
                  <div className="about-edu-edit-field">
                    <label className="about-edu-edit-label">School / University</label>
                    <input className="about-edu-edit-input" value={item.school} placeholder="e.g. Massachusetts Institute of Technology" onChange={e => setEdu(d => d.map((x, i) => i === idx ? { ...x, school: e.target.value } : x))} />
                  </div>
                  <div className="about-edu-edit-field">
                    <label className="about-edu-edit-label">Type</label>
                    <div className="about-select-wrap">
                      <select className="about-select" value={item.type} onChange={e => setEdu(d => d.map((x, i) => i === idx ? { ...x, type: e.target.value } : x))}>
                        <option value="University">University</option>
                        <option value="High School">High School</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Online Course">Online Course</option>
                        <option value="Bootcamp">Bootcamp</option>
                      </select>
                      <Chevron />
                    </div>
                  </div>
                  <div className="about-edu-edit-field">
                    <label className="about-edu-edit-label">Degree / Certificate</label>
                    <input className="about-edu-edit-input" value={item.degree} placeholder="e.g. B.Sc Computer Science" onChange={e => setEdu(d => d.map((x, i) => i === idx ? { ...x, degree: e.target.value } : x))} />
                  </div>
                  <div className="about-edu-edit-field">
                    <label className="about-edu-edit-label">Years</label>
                    <input className="about-edu-edit-input" value={item.years} placeholder="e.g. 2018 – 2022" onChange={e => setEdu(d => d.map((x, i) => i === idx ? { ...x, years: e.target.value } : x))} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="ob-add-edu" onClick={() => setEdu(d => [...d, newEdu()])}>
              <PlusIcon /> Add Education
            </button>
          </div>
        </section>
        )}

        <div className="ob-footer">
          {step === 1 && (
            <button type="button" className="ob-skip-btn" onClick={goNext}>Skip</button>
          )}
          {step > 1 && (
            <button type="button" className="ob-back-btn" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {step < 3 ? (
            <button type="button" className="ob-save-btn" onClick={goNext}>Next</button>
          ) : (
            <button className="ob-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save & Continue'}
            </button>
          )}
        </div>

        {cropTarget && (
          <ImageCropper
            file={cropTarget.file}
            defaultAspect={cropTarget.kind === 'avatar' ? 'square' : 'landscape'}
            cropShape={cropTarget.kind === 'avatar' ? 'round' : 'rect'}
            onCancel={() => setCropTarget(null)}
            onSkip={() => applyCroppedImage(cropTarget.file)}
            onSave={applyCroppedImage}
          />
        )}
      </div>
    </div>
  );
}
